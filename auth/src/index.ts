import express, { RequestHandler } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { ensureSchema, db } from "./db/pool.js";
import { authRouter } from "./routes/auth.routes.js";
import {
  authMiddleware,
  adminOnly,
  AuthRequest,
} from "./middleware/authMiddleware.js";

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `image-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req: any, file: any, cb: any) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const fileExtension = String(path.extname(file.originalname)).toLowerCase();

  if (
    allowedMimeTypes.includes(file.mimetype) &&
    allowedExtensions.includes(fileExtension)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Tipo de arquivo não permitido. Apenas imagens são aceitas (JPEG, PNG, GIF, WebP). Tipo enviado: ${file.mimetype}`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

app.use("/auth", authRouter);

app.get("/health", (_req, res) => {
  return res.json({ ok: true, service: "auth-root" });
});

const adminOnlyHandler: RequestHandler = (req, res) => {
  const authReq = req as AuthRequest;

  return res.json({
    message: "Área exclusiva de administradores",
    user: authReq.user,
  });
};

app.get("/auth/admin-only", authMiddleware, adminOnly, adminOnlyHandler);

app.post(
  "/auth/upload",
  authMiddleware,
  (req, res, next) => {
    const uploadSingle = upload.single("image");

    uploadSingle(req as any, res as any, (err: any) => {
      if (err instanceof multer.MulterError) {
        let errorMessage = "";

        switch (err.code) {
          case "LIMIT_FILE_SIZE":
            errorMessage =
              "Arquivo muito grande. Tamanho máximo permitido: 5MB";
            break;
          case "LIMIT_FILE_COUNT":
            errorMessage = "Muitos arquivos. Envie apenas uma imagem por vez";
            break;
          case "LIMIT_UNEXPECTED_FILE":
            errorMessage = 'Campo de arquivo inesperado. Use o campo "image"';
            break;
          default:
            errorMessage = `Erro no upload: ${err.message}`;
        }

        return res.status(400).json({
          success: false,
          error: errorMessage,
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          error: err.message,
        });
      }

      return next();
    });
  },
  async (req, res) => {
    const authReq = req as AuthRequest & { file?: Express.Multer.File };

    if (!authReq.file) {
      return res.status(400).json({
        success: false,
        error: "Nenhuma imagem foi enviada",
      });
    }

    if (!authReq.user?.id) {
      return res.status(401).json({
        success: false,
        error: "Usuário não autenticado",
      });
    }

    const fileInfo = {
      originalName: authReq.file.originalname,
      filename: authReq.file.filename,
      mimetype: authReq.file.mimetype,
      size: authReq.file.size,
      path: authReq.file.path,
      url: `/auth/uploads/${authReq.file.filename}`,
      userId: authReq.user.id,
    };

    console.log("Upload realizado com sucesso:", fileInfo);

    try {
      await db.query(
        `
          UPDATE users
          SET url_img = $1, updated_at = NOW()
          WHERE id = $2
        `,
        [fileInfo.url, authReq.user.id]
      );
    } catch (error) {
      console.error("Erro ao salvar url_img no banco:", error);
      return res.status(500).json({
        success: false,
        error: "Imagem enviada, mas ocorreu um erro ao salvar no perfil.",
        file: fileInfo,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Imagem enviada com sucesso!",
      file: fileInfo,
    });
  }
);

app.use("/auth/uploads", express.static(uploadsDir));
ensureSchema()
  .then(() => {
    app.listen(3000, () => {
      console.log("auth up on 3000");
    });
  })
  .catch((err) => {
    console.error("Erro ao garantir schema do banco:", err);
    process.exit(1);
  });
