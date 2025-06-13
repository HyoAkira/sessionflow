export default function (req, res, next) {
  console.log(req.body);
  const { clientData } = req.body;
  if (!clientData) {
    return res.status(400).json({
      message: "Client data is required",
      error: true,
    });
  } else {
    res.locals.clientData = clientData;
    next();
  }
}
