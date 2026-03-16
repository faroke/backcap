"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCommand = addCommand;
var fs_1 = require("fs");
var path_1 = require("path");
var chalk_1 = require("chalk");
var ora_1 = require("ora");
var index_js_1 = require("../registry/index.js");
var index_js_2 = require("../generator/index.js");
function addCommand(capabilityName) {
    return __awaiter(this, void 0, void 0, function () {
        var spinner, configPath, configContent, config, capability, capabilityDir, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    spinner = (0, ora_1.default)("Adding ".concat(capabilityName, " capability...")).start();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    configPath = path_1.default.join(process.cwd(), 'backcap.json');
                    return [4 /*yield*/, fs_1.promises.readFile(configPath, 'utf-8')];
                case 2:
                    configContent = _a.sent();
                    config = JSON.parse(configContent);
                    capability = (0, index_js_1.getCapability)(capabilityName);
                    if (!capability) {
                        spinner.fail(chalk_1.default.red("Capability \"".concat(capabilityName, "\" not found in registry")));
                        process.exit(1);
                    }
                    capabilityDir = path_1.default.join(process.cwd(), 'capabilities', capabilityName);
                    return [4 /*yield*/, (0, index_js_2.generateCapability)(capability, capabilityDir, config)];
                case 3:
                    _a.sent();
                    if (!!config.capabilities.includes(capabilityName)) return [3 /*break*/, 5];
                    config.capabilities.push(capabilityName);
                    return [4 /*yield*/, fs_1.promises.writeFile(configPath, JSON.stringify(config, null, 2))];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    spinner.succeed(chalk_1.default.green("Added ".concat(capabilityName, " capability!")));
                    console.log(chalk_1.default.gray('\nGenerated structure:'));
                    console.log(chalk_1.default.gray("  capabilities/".concat(capabilityName, "/")));
                    console.log(chalk_1.default.gray("    \u251C\u2500\u2500 spec.yaml"));
                    console.log(chalk_1.default.gray("    \u251C\u2500\u2500 core/"));
                    console.log(chalk_1.default.gray("    \u251C\u2500\u2500 ports/"));
                    console.log(chalk_1.default.gray("    \u251C\u2500\u2500 usecases/"));
                    console.log(chalk_1.default.gray("    \u2514\u2500\u2500 skills/\n"));
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    spinner.fail(chalk_1.default.red('Error adding capability'));
                    console.error(error_1);
                    process.exit(1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
