export const errorHandler = (err, req, res, next) => {
  // If the error has a status code, use it; otherwise, use 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    message: err.message,
    // Only show stack trace in development mode
    stack: process.env.NODE_BIT === 'development' ? err.stack : null,
  });
};