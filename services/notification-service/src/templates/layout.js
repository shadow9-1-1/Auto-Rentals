const layout = (content, title) => `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>${title}</title>
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    font-size: 16px;
    line-height: 1.5;
    margin: 0;
    padding: 0;
    background-color: #f6f6f6;
  }
  .container {
    max-width: 600px;
    margin: 20px auto;
    padding: 20px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  }
  .header {
    text-align: center;
    padding-bottom: 20px;
    border-bottom: 1px solid #eeeeee;
    margin-bottom: 20px;
  }
  .header h2 {
    color: #333333;
    margin: 0;
  }
  .content {
    color: #555555;
  }
  .content h3 {
    color: #333333;
  }
  .footer {
    text-align: center;
    color: #999999;
    font-size: 12px;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eeeeee;
  }
  .button {
    display: inline-block;
    padding: 12px 24px;
    background-color: #007bff;
    color: #ffffff;
    text-decoration: none;
    border-radius: 4px;
    font-weight: bold;
    margin-top: 20px;
  }
  .details-box {
    background-color: #f9f9f9;
    padding: 15px;
    border-radius: 4px;
    margin: 20px 0;
  }
  .details-box ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  .details-box li {
    margin-bottom: 8px;
  }
  @media only screen and (max-width: 620px) {
    .container {
      margin: 10px;
      width: auto !important;
      padding: 15px;
    }
  }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Auto Rentals</h2>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Auto Rentals. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

module.exports = layout;
