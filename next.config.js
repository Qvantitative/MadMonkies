/** @type {import('next').NextConfig} */
module.exports = {
  // Your existing configuration
  target: 'server', // Ensure the target is set to 'server' if using a custom server
  reactStrictMode: true,
  // Remove the experimental reactRefresh option, as it's no longer valid in this version
  // Other configurations can go here
};