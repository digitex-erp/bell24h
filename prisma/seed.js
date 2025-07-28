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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var faker_1 = require("@faker-js/faker");
var bcryptjs_1 = require("bcryptjs");
var prisma = new client_1.PrismaClient();
// Helper function to generate random dates within a range
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
// Helper function to generate GST number
function generateGSTNumber() {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '22';
    for (var i = 0; i < 10; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var adminCompany, adminUser, _a, _b, buyerCompanies, buyerUsers, i, company, user, _c, _d, supplierCompanies, supplierUsers, i, company, user, _e, _f, productCategories, allProducts, _i, _g, company, productCount, i, product, allRfqs, rfqStatuses, _h, buyerUsers_1, buyer, rfqCount, i, status_1, rfq, _j, allRfqs_1, rfq, bidderCount, bidders, _k, bidders_1, bidder, bidStatus, industrialChemicals, constructionMaterials, agriculture;
        var _l, _m, _o, _p, _q, _r;
        return __generator(this, function (_s) {
            switch (_s.label) {
                case 0:
                    console.log('🌱 Seeding database...');
                    // Clear existing data
                    console.log('🧹 Clearing existing data...');
                    return [4 /*yield*/, prisma.$transaction([
                            prisma.bid.deleteMany(),
                            prisma.rFQ.deleteMany(),
                            prisma.user.deleteMany(),
                            prisma.company.deleteMany(),
                            prisma.product.deleteMany(),
                        ])];
                case 1:
                    _s.sent();
                    // Create admin user and company
                    console.log('👔 Creating admin user and company...');
                    return [4 /*yield*/, prisma.company.create({
                            data: {
                                name: 'Bell24H Admin',
                                industry: 'Technology',
                                website: 'https://bell24h.com',
                                isVerified: true,
                                gstNumber: '22AAAAA0000A1Z5',
                                gstVerified: true,
                            },
                        })];
                case 2:
                    adminCompany = _s.sent();
                    _b = (_a = prisma.user).create;
                    _l = {};
                    _m = {
                        email: 'admin@bell24h.com',
                        name: 'Admin User'
                    };
                    return [4 /*yield*/, (0, bcryptjs_1.hash)('Admin@123', 10)];
                case 3: return [4 /*yield*/, _b.apply(_a, [(_l.data = (_m.password = _s.sent(),
                            _m.role = 'ADMIN',
                            _m.isEmailVerified = true,
                            _m.companyId = adminCompany.id,
                            _m),
                            _l)])];
                case 4:
                    adminUser = _s.sent();
                    // Create buyer companies and users
                    console.log('👥 Creating buyer companies and users...');
                    buyerCompanies = [];
                    buyerUsers = [];
                    i = 0;
                    _s.label = 5;
                case 5:
                    if (!(i < 5)) return [3 /*break*/, 10];
                    return [4 /*yield*/, prisma.company.create({
                            data: {
                                name: "".concat(faker_1.faker.company.name(), " ").concat(faker_1.faker.company.suffix()),
                                industry: faker_1.faker.commerce.department(),
                                website: faker_1.faker.internet.url(),
                                isVerified: faker_1.faker.datatype.boolean(),
                                gstNumber: generateGSTNumber(),
                                gstVerified: faker_1.faker.datatype.boolean({ probability: 0.7 }),
                            },
                        })];
                case 6:
                    company = _s.sent();
                    buyerCompanies.push(company);
                    _d = (_c = prisma.user).create;
                    _o = {};
                    _p = {
                        email: "buyer".concat(i, "@example.com"),
                        name: faker_1.faker.person.fullName()
                    };
                    return [4 /*yield*/, (0, bcryptjs_1.hash)('Buyer@123', 10)];
                case 7: return [4 /*yield*/, _d.apply(_c, [(_o.data = (_p.password = _s.sent(),
                            _p.role = 'BUYER',
                            _p.isEmailVerified = true,
                            _p.companyId = company.id,
                            _p),
                            _o)])];
                case 8:
                    user = _s.sent();
                    buyerUsers.push(user);
                    _s.label = 9;
                case 9:
                    i++;
                    return [3 /*break*/, 5];
                case 10:
                    // Create supplier companies and users
                    console.log('🏭 Creating supplier companies and users...');
                    supplierCompanies = [];
                    supplierUsers = [];
                    i = 0;
                    _s.label = 11;
                case 11:
                    if (!(i < 10)) return [3 /*break*/, 16];
                    return [4 /*yield*/, prisma.company.create({
                            data: {
                                name: "".concat(faker_1.faker.company.name(), " ").concat(faker_1.faker.company.companySuffix()),
                                industry: faker_1.faker.commerce.department(),
                                website: faker_1.faker.internet.url(),
                                isVerified: faker_1.faker.datatype.boolean({ probability: 0.8 }),
                                gstNumber: generateGSTNumber(),
                                gstVerified: faker_1.faker.datatype.boolean({ probability: 0.8 }),
                            },
                        })];
                case 12:
                    company = _s.sent();
                    supplierCompanies.push(company);
                    _f = (_e = prisma.user).create;
                    _q = {};
                    _r = {
                        email: "supplier".concat(i, "@example.com"),
                        name: faker_1.faker.person.fullName()
                    };
                    return [4 /*yield*/, (0, bcryptjs_1.hash)('Supplier@123', 10)];
                case 13: return [4 /*yield*/, _f.apply(_e, [(_q.data = (_r.password = _s.sent(),
                            _r.role = 'SUPPLIER',
                            _r.isEmailVerified = true,
                            _r.companyId = company.id,
                            _r),
                            _q)])];
                case 14:
                    user = _s.sent();
                    supplierUsers.push(user);
                    _s.label = 15;
                case 15:
                    i++;
                    return [3 /*break*/, 11];
                case 16:
                    // Create products for suppliers
                    console.log('📦 Creating products...');
                    productCategories = [
                        'Electronics', 'Furniture', 'Office Supplies', 'Raw Materials',
                        'Industrial Equipment', 'Packaging', 'Safety Equipment', 'Tools'
                    ];
                    allProducts = [];
                    _i = 0, _g = __spreadArray(__spreadArray([], supplierCompanies, true), [adminCompany], false);
                    _s.label = 17;
                case 17:
                    if (!(_i < _g.length)) return [3 /*break*/, 22];
                    company = _g[_i];
                    productCount = faker_1.faker.number.int({ min: 5, max: 15 });
                    i = 0;
                    _s.label = 18;
                case 18:
                    if (!(i < productCount)) return [3 /*break*/, 21];
                    return [4 /*yield*/, prisma.product.create({
                            data: {
                                name: "".concat(faker_1.faker.commerce.productName(), " ").concat(faker_1.faker.commerce.productAdjective()),
                                description: faker_1.faker.commerce.productDescription(),
                                unit: faker_1.faker.helpers.arrayElement(['pcs', 'kg', 'm', 'l', 'box', 'set']),
                                companyId: company.id,
                                category: faker_1.faker.helpers.arrayElement(productCategories),
                                price: parseFloat(faker_1.faker.commerce.price({ min: 10, max: 1000, dec: 2 })),
                                minOrderQuantity: faker_1.faker.number.int({ min: 1, max: 100 }),
                                isActive: faker_1.faker.datatype.boolean({ probability: 0.9 }),
                            },
                        })];
                case 19:
                    product = _s.sent();
                    allProducts.push(product);
                    _s.label = 20;
                case 20:
                    i++;
                    return [3 /*break*/, 18];
                case 21:
                    _i++;
                    return [3 /*break*/, 17];
                case 22:
                    // Create RFQs from buyers
                    console.log('📝 Creating RFQs...');
                    allRfqs = [];
                    rfqStatuses = ['DRAFT', 'PUBLISHED', 'CLOSED', 'AWARDED', 'CANCELLED'];
                    _h = 0, buyerUsers_1 = buyerUsers;
                    _s.label = 23;
                case 23:
                    if (!(_h < buyerUsers_1.length)) return [3 /*break*/, 28];
                    buyer = buyerUsers_1[_h];
                    rfqCount = faker_1.faker.number.int({ min: 3, max: 8 });
                    i = 0;
                    _s.label = 24;
                case 24:
                    if (!(i < rfqCount)) return [3 /*break*/, 27];
                    status_1 = faker_1.faker.helpers.arrayElement(rfqStatuses);
                    return [4 /*yield*/, prisma.rFQ.create({
                            data: {
                                title: "RFQ-".concat(faker_1.faker.string.alphanumeric(6).toUpperCase(), " - ").concat(faker_1.faker.commerce.productName()),
                                description: faker_1.faker.lorem.paragraphs(3),
                                status: status_1,
                                deadline: randomDate(new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // Within next 30 days
                                deliveryAddress: "".concat(faker_1.faker.location.streetAddress(), ", ").concat(faker_1.faker.location.city(), ", ").concat(faker_1.faker.location.state(), ", ").concat(faker_1.faker.location.zipCode(), ", ").concat(faker_1.faker.location.country()),
                                paymentTerms: faker_1.faker.helpers.arrayElement(['Net 30', 'Net 45', '50% Advance, 50% on Delivery', '100% Advance']),
                                userId: buyer.id,
                                companyId: buyer.companyId,
                            },
                        })];
                case 25:
                    rfq = _s.sent();
                    allRfqs.push(rfq);
                    _s.label = 26;
                case 26:
                    i++;
                    return [3 /*break*/, 24];
                case 27:
                    _h++;
                    return [3 /*break*/, 23];
                case 28:
                    // Create bids for RFQs
                    console.log('💰 Creating bids...');
                    _j = 0, allRfqs_1 = allRfqs;
                    _s.label = 29;
                case 29:
                    if (!(_j < allRfqs_1.length)) return [3 /*break*/, 34];
                    rfq = allRfqs_1[_j];
                    if (rfq.status === 'DRAFT' || rfq.status === 'CANCELLED')
                        return [3 /*break*/, 33];
                    bidderCount = faker_1.faker.number.int({ min: 1, max: Math.min(5, supplierUsers.length) });
                    bidders = faker_1.faker.helpers.arrayElements(supplierUsers, bidderCount);
                    _k = 0, bidders_1 = bidders;
                    _s.label = 30;
                case 30:
                    if (!(_k < bidders_1.length)) return [3 /*break*/, 33];
                    bidder = bidders_1[_k];
                    bidStatus = rfq.status === 'AWARDED' && bidders[0] === bidder
                        ? 'ACCEPTED'
                        : faker_1.faker.helpers.arrayElement(['PENDING', 'SUBMITTED', 'REJECTED']);
                    return [4 /*yield*/, prisma.bid.create({
                            data: {
                                amount: parseFloat(faker_1.faker.commerce.price({ min: 100, max: 10000, dec: 2 })),
                                validityDays: faker_1.faker.number.int({ min: 7, max: 60 }),
                                notes: faker_1.faker.lorem.paragraph(),
                                status: bidStatus,
                                rfqId: rfq.id,
                                userId: bidder.id,
                                companyId: bidder.companyId,
                            },
                        })];
                case 31:
                    _s.sent();
                    _s.label = 32;
                case 32:
                    _k++;
                    return [3 /*break*/, 30];
                case 33:
                    _j++;
                    return [3 /*break*/, 29];
                case 34:
                    console.log("\u2705 Created ".concat(buyerCompanies.length, " buyer companies with users"));
                    console.log("\u2705 Created ".concat(supplierCompanies.length, " supplier companies with users"));
                    console.log("\u2705 Created ".concat(allProducts.length, " products"));
                    console.log("\u2705 Created ".concat(allRfqs.length, " RFQs"));
                    console.log('✅ Database seeded successfully!');
                    console.log('Start seeding categories...');
                    return [4 /*yield*/, prisma.category.create({
                            data: {
                                name: 'Industrial Chemicals',
                                description: 'Chemicals used in industrial processes.',
                            },
                        })];
                case 35:
                    industrialChemicals = _s.sent();
                    return [4 /*yield*/, prisma.category.createMany({
                            data: [
                                { name: 'Acids', parentId: industrialChemicals.id },
                                { name: 'Solvents', parentId: industrialChemicals.id },
                                { name: 'Adhesives & Sealants', parentId: industrialChemicals.id },
                            ],
                        })];
                case 36:
                    _s.sent();
                    return [4 /*yield*/, prisma.category.create({
                            data: {
                                name: 'Construction Materials',
                                description: 'Materials used for building and construction.',
                            },
                        })];
                case 37:
                    constructionMaterials = _s.sent();
                    return [4 /*yield*/, prisma.category.createMany({
                            data: [
                                { name: 'Cement & Concrete', parentId: constructionMaterials.id },
                                { name: 'Bricks & Blocks', parentId: constructionMaterials.id },
                                { name: 'Steel & Metals', parentId: constructionMaterials.id },
                            ],
                        })];
                case 38:
                    _s.sent();
                    return [4 /*yield*/, prisma.category.create({
                            data: {
                                name: 'Agriculture & Farming',
                                description: 'Products for agriculture and farming.',
                            },
                        })];
                case 39:
                    agriculture = _s.sent();
                    return [4 /*yield*/, prisma.category.createMany({
                            data: [
                                { name: 'Fertilizers', parentId: agriculture.id },
                                { name: 'Pesticides', parentId: agriculture.id },
                                { name: 'Seeds & Grains', parentId: agriculture.id },
                            ],
                        })];
                case 40:
                    _s.sent();
                    console.log('Category seeding finished.');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
