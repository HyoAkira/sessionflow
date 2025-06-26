export default function (err, req, res, next) {
  err.code = err.code || err.statusCode || 500;
  switch (err.code) {
    case 400:
      res.status(400).json({
        message: err.message || "Bad Request",
        error: true,
        code: 400,
      });
      break;
    case 401:
      res.status(401).json({
        message: err.message || "Unauthorized",
        error: true,
        code: 401,
      });
      break;
    case 403:
      res.status(403).json({
        message: err.message || "Forbidden",
        error: true,
        code: 403,
      });
      break;
    case 404:
      res.status(404).json({
        message: err.message || "Not Found",
        error: true,
        code: 404,
      });
      break;
    case 500:
      res.status(500).json({
        message: err.message || "Internal Server Error",
        error: true,
        code: 500,
      });
      break;
    case 409:
      res.status(409).json({
        message: err.message || "Conflict",
        error: true,
        code: 409,
      });
      break;
    default:
      res.status(500).json({
        message: err.message || "Internal Server Error",
        error: true,
        code: 500,
      });
      break;
  }
}
