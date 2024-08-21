import jwt from 'jsonwebtoken';

export const generateToken = (user, message, statusCode, res) => {
  // Set JWT expiration (e.g., 1 hour)
  const jwtExpire = process.env.JWT_EXPIRE || '1h';

  // Generate the token
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET_KEY, {
    expiresIn: jwtExpire,
  });

  // Decode the token to get expiration time
  const decodedToken = jwt.decode(token);
  if (!decodedToken || !decodedToken.exp) {
    console.error('Failed to decode token or token does not have an expiration time.');
    return res.status(500).json({
      success: false,
      message: 'Token generation failed.',
    });
  }

  // Calculate expiration date from the expiration timestamp (in seconds)
  const expiresAt = new Date(decodedToken.exp * 1000); // Convert from seconds to milliseconds
  console.log(`Generated Token: ${token}`);
  console.log(`Token Expiration Time: ${expiresAt}`);

  // Determine the cookie name based on the user's role
  const cookieName = user.role === 'Admin' ? 'adminToken' : 'patientToken';

  // Calculate cookie expiration (e.g., 1 day)
  const cookieExpireDays = Number(process.env.COOKIE_EXPIRE) || 1;
  const cookieExpires = new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000);

  // Set the cookie and send the response
  res
    .status(statusCode)
    .cookie(cookieName, token, {
      expires: cookieExpires,
      httpOnly: true,
    })
    .json({
      success: true,
      message,
      user,
      token,
    });
};
