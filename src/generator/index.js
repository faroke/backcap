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
exports.generateCapability = generateCapability;
var fs_1 = require("fs");
var path_1 = require("path");
var yaml_1 = require("yaml");
function generateCapability(capability, targetDir, config) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs_1.promises.mkdir(targetDir, { recursive: true })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, generateSpec(capability.spec, targetDir)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, generateCore(capability.spec, targetDir)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, generatePorts(capability.spec, targetDir)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, generateUsecases(capability.spec, targetDir)];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, generateEvents(capability.spec, targetDir)];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, generateAdapters(capability.spec, targetDir, config)];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, generateTests(capability.spec, targetDir)];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, generateSkills(capability.spec, targetDir)];
                case 9:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function generateSpec(spec, targetDir) {
    return __awaiter(this, void 0, void 0, function () {
        var specPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    specPath = path_1.default.join(targetDir, 'spec.yaml');
                    return [4 /*yield*/, fs_1.promises.writeFile(specPath, yaml_1.default.stringify(spec))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function generateCore(spec, targetDir) {
    return __awaiter(this, void 0, void 0, function () {
        var coreDir, entitiesPath, entitiesContent, _i, _a, _b, entityName, fields, _c, _d, _e, fieldName, fieldType, tsType;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    coreDir = path_1.default.join(targetDir, 'core');
                    return [4 /*yield*/, fs_1.promises.mkdir(coreDir, { recursive: true })];
                case 1:
                    _f.sent();
                    if (!spec.entities) return [3 /*break*/, 3];
                    entitiesPath = path_1.default.join(coreDir, 'entities.ts');
                    entitiesContent = '// Domain Entities\n\n';
                    for (_i = 0, _a = Object.entries(spec.entities); _i < _a.length; _i++) {
                        _b = _a[_i], entityName = _b[0], fields = _b[1];
                        entitiesContent += "export interface ".concat(entityName, " {\n");
                        for (_c = 0, _d = Object.entries(fields); _c < _d.length; _c++) {
                            _e = _d[_c], fieldName = _e[0], fieldType = _e[1];
                            tsType = mapType(fieldType);
                            entitiesContent += "  ".concat(fieldName, ": ").concat(tsType, ";\n");
                        }
                        entitiesContent += '}\n\n';
                    }
                    return [4 /*yield*/, fs_1.promises.writeFile(entitiesPath, entitiesContent)];
                case 2:
                    _f.sent();
                    _f.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function generatePorts(spec, targetDir) {
    return __awaiter(this, void 0, void 0, function () {
        var portsDir, _i, _a, port, portPath, portContent;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    portsDir = path_1.default.join(targetDir, 'ports');
                    return [4 /*yield*/, fs_1.promises.mkdir(portsDir, { recursive: true })];
                case 1:
                    _b.sent();
                    if (!spec.ports) return [3 /*break*/, 5];
                    _i = 0, _a = spec.ports;
                    _b.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 5];
                    port = _a[_i];
                    portPath = path_1.default.join(portsDir, "".concat(toKebabCase(port), ".ts"));
                    portContent = generatePortInterface(port, spec);
                    return [4 /*yield*/, fs_1.promises.writeFile(portPath, portContent)];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function generateUsecases(spec, targetDir) {
    return __awaiter(this, void 0, void 0, function () {
        var usecasesDir, _i, _a, usecase, usecasePath, usecaseContent;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    usecasesDir = path_1.default.join(targetDir, 'usecases');
                    return [4 /*yield*/, fs_1.promises.mkdir(usecasesDir, { recursive: true })];
                case 1:
                    _b.sent();
                    if (!spec.usecases) return [3 /*break*/, 5];
                    _i = 0, _a = spec.usecases;
                    _b.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 5];
                    usecase = _a[_i];
                    usecasePath = path_1.default.join(usecasesDir, "".concat(toKebabCase(usecase), ".ts"));
                    usecaseContent = generateUsecaseClass(usecase, spec);
                    return [4 /*yield*/, fs_1.promises.writeFile(usecasePath, usecaseContent)];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function generateEvents(spec, targetDir) {
    return __awaiter(this, void 0, void 0, function () {
        var eventsDir, eventsPath, eventsContent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    eventsDir = path_1.default.join(targetDir, 'events');
                    return [4 /*yield*/, fs_1.promises.mkdir(eventsDir, { recursive: true })];
                case 1:
                    _a.sent();
                    if (!spec.events) return [3 /*break*/, 3];
                    eventsPath = path_1.default.join(eventsDir, 'index.ts');
                    eventsContent = '// Domain Events\n\n';
                    eventsContent += 'export type EventType =\n';
                    eventsContent += spec.events.map(function (e) { return "  | '".concat(e, "'"); }).join('\n');
                    eventsContent += ';\n\n';
                    eventsContent += "export interface DomainEvent {\n";
                    eventsContent += "  type: EventType;\n";
                    eventsContent += "  timestamp: Date;\n";
                    eventsContent += "  data: unknown;\n";
                    eventsContent += "}\n";
                    return [4 /*yield*/, fs_1.promises.writeFile(eventsPath, eventsContent)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function generateAdapters(spec, targetDir, config) {
    return __awaiter(this, void 0, void 0, function () {
        var adaptersDir, _i, _a, port, adapterPath, adapterContent;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    adaptersDir = path_1.default.join(targetDir, 'adapters');
                    return [4 /*yield*/, fs_1.promises.mkdir(adaptersDir, { recursive: true })];
                case 1:
                    _b.sent();
                    if (!spec.ports) return [3 /*break*/, 5];
                    _i = 0, _a = spec.ports;
                    _b.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 5];
                    port = _a[_i];
                    if (!port.includes('Repository')) return [3 /*break*/, 4];
                    adapterPath = path_1.default.join(adaptersDir, "".concat(toKebabCase(port), "-").concat(config.orm, ".ts"));
                    adapterContent = generateRepositoryAdapter(port, spec, config.orm);
                    return [4 /*yield*/, fs_1.promises.writeFile(adapterPath, adapterContent)];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function generateTests(spec, targetDir) {
    return __awaiter(this, void 0, void 0, function () {
        var testsDir, testPath, testContent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    testsDir = path_1.default.join(targetDir, 'tests');
                    return [4 /*yield*/, fs_1.promises.mkdir(testsDir, { recursive: true })];
                case 1:
                    _a.sent();
                    testPath = path_1.default.join(testsDir, "".concat(spec.capability, ".test.ts"));
                    testContent = "import { describe, it, expect } from 'vitest';\n\ndescribe('".concat(spec.capability, "', () => {\n  it('should be implemented', () => {\n    expect(true).toBe(true);\n  });\n});\n");
                    return [4 /*yield*/, fs_1.promises.writeFile(testPath, testContent)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function generateSkills(spec, targetDir) {
    return __awaiter(this, void 0, void 0, function () {
        var skillsDir, skills, _i, skills_1, skill, skillPath, skillContent;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    skillsDir = path_1.default.join(targetDir, 'skills');
                    return [4 /*yield*/, fs_1.promises.mkdir(skillsDir, { recursive: true })];
                case 1:
                    _d.sent();
                    skills = [
                        {
                            name: 'extend-capability',
                            description: 'Add new features to this capability',
                        },
                        {
                            name: 'add-usecase',
                            description: 'Add a new use case',
                        },
                        {
                            name: 'add-event',
                            description: 'Add a new domain event',
                        },
                    ];
                    _i = 0, skills_1 = skills;
                    _d.label = 2;
                case 2:
                    if (!(_i < skills_1.length)) return [3 /*break*/, 5];
                    skill = skills_1[_i];
                    skillPath = path_1.default.join(skillsDir, "".concat(skill.name, ".md"));
                    skillContent = "# ".concat(skill.name, "\n\n## Description\n").concat(skill.description, "\n\n## Context\nCapability: ").concat(spec.capability, "\nVersion: ").concat(spec.version, "\n\n## Available Information\n- Entities: ").concat(spec.entities ? Object.keys(spec.entities).join(', ') : 'none', "\n- Use Cases: ").concat(((_a = spec.usecases) === null || _a === void 0 ? void 0 : _a.join(', ')) || 'none', "\n- Events: ").concat(((_b = spec.events) === null || _b === void 0 ? void 0 : _b.join(', ')) || 'none', "\n- Ports: ").concat(((_c = spec.ports) === null || _c === void 0 ? void 0 : _c.join(', ')) || 'none', "\n\n## Instructions\nWhen using this skill, the AI should:\n1. Read the capability spec.yaml\n2. Understand the current architecture\n3. Generate code that follows the existing patterns\n4. Update the spec.yaml if adding new entities/events\n5. Maintain clean architecture principles\n");
                    return [4 /*yield*/, fs_1.promises.writeFile(skillPath, skillContent)];
                case 3:
                    _d.sent();
                    _d.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function generatePortInterface(port, spec) {
    var methods = generatePortMethods(port, spec);
    return "// Port: ".concat(port, "\n\nexport interface ").concat(port, " {\n").concat(methods.map(function (m) { return "  ".concat(m.name, "(").concat(m.params, "): Promise<").concat(m.returnType, ">;"); }).join('\n'), "\n}\n");
}
function generatePortMethods(port, spec) {
    if (port.includes('Repository')) {
        var entityName = port.replace('Repository', '');
        return [
            { name: 'findById', params: 'id: string', returnType: "".concat(entityName, " | null") },
            { name: 'save', params: "entity: ".concat(entityName), returnType: "".concat(entityName) },
            { name: 'delete', params: 'id: string', returnType: 'void' },
            { name: 'findAll', params: '', returnType: "".concat(entityName, "[]") },
        ];
    }
    return [{ name: 'execute', params: '', returnType: 'void' }];
}
function generateUsecaseClass(usecase, spec) {
    var _a;
    var className = toPascalCase(usecase);
    var ports = ((_a = spec.ports) === null || _a === void 0 ? void 0 : _a.join(', ')) || '';
    return "// Use Case: ".concat(usecase, "\n\nexport class ").concat(className, " {\n  constructor(\n    // Inject ports here\n  ) {}\n\n  async execute(input: ").concat(className, "Input): Promise<").concat(className, "Output> {\n    // Implement use case logic\n    throw new Error('Not implemented');\n  }\n}\n\nexport interface ").concat(className, "Input {\n  // Define input parameters\n}\n\nexport interface ").concat(className, "Output {\n  // Define output structure\n}\n");
}
function generateRepositoryAdapter(port, spec, orm) {
    var entityName = port.replace('Repository', '');
    if (orm === 'prisma') {
        return "// Prisma Adapter for ".concat(port, "\nimport { PrismaClient } from '@prisma/client';\nimport { ").concat(port, " } from '../ports/").concat(toKebabCase(port), ".js';\nimport { ").concat(entityName, " } from '../core/entities.js';\n\nexport class Prisma").concat(port, " implements ").concat(port, " {\n  constructor(private prisma: PrismaClient) {}\n\n  async findById(id: string): Promise<").concat(entityName, " | null> {\n    // Implement with Prisma\n    throw new Error('Not implemented');\n  }\n\n  async save(entity: ").concat(entityName, "): Promise<").concat(entityName, "> {\n    // Implement with Prisma\n    throw new Error('Not implemented');\n  }\n\n  async delete(id: string): Promise<void> {\n    // Implement with Prisma\n    throw new Error('Not implemented');\n  }\n\n  async findAll(): Promise<").concat(entityName, "[]> {\n    // Implement with Prisma\n    throw new Error('Not implemented');\n  }\n}\n");
    }
    return "// ".concat(orm, " Adapter for ").concat(port, "\nimport { ").concat(port, " } from '../ports/").concat(toKebabCase(port), ".js';\nimport { ").concat(entityName, " } from '../core/entities.js';\n\nexport class ").concat(orm.charAt(0).toUpperCase() + orm.slice(1)).concat(port, " implements ").concat(port, " {\n  async findById(id: string): Promise<").concat(entityName, " | null> {\n    throw new Error('Not implemented');\n  }\n\n  async save(entity: ").concat(entityName, "): Promise<").concat(entityName, "> {\n    throw new Error('Not implemented');\n  }\n\n  async delete(id: string): Promise<void> {\n    throw new Error('Not implemented');\n  }\n\n  async findAll(): Promise<").concat(entityName, "[]> {\n    throw new Error('Not implemented');\n  }\n}\n");
}
function mapType(type) {
    var typeMap = {
        string: 'string',
        number: 'number',
        boolean: 'boolean',
        date: 'Date',
        'string[]': 'string[]',
        'number[]': 'number[]',
    };
    return typeMap[type] || 'unknown';
}
function toKebabCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
function toPascalCase(str) {
    return str
        .split(/[-_]/)
        .map(function (word) { return word.charAt(0).toUpperCase() + word.slice(1); })
        .join('');
}
