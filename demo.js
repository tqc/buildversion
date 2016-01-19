var buildVersion = require("./src");
var data = buildVersion(["gitrunner", "package-path", "glob"]);

console.log(data);
