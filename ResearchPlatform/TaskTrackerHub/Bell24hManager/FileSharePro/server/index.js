"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var path_1 = require("path");
var cors_1 = require("cors");
var app = (0, express_1.default)();
var port = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static('frontend'));
// Sample RFQ data
var sampleRFQs = [
    {
        id: 1,
        title: "Industrial Machinery Parts",
        description: "Looking for CNC machine components",
        category: "Manufacturing",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        deliveryLocation: "Mumbai"
    },
    {
        id: 2,
        title: "Electronic Components",
        description: "Bulk order for PCB components",
        category: "Electronics",
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        deliveryLocation: "Delhi"
    }
];
// API Routes
app.get('/api/rfqs', function (req, res) {
    res.json(sampleRFQs);
});
app.get('/api/rfq/:id', function (req, res) {
    var rfq = sampleRFQs.find(function (r) { return r.id === parseInt(req.params.id); });
    if (rfq) {
        res.json(rfq);
    }
    else {
        res.status(404).json({ error: 'RFQ not found' });
    }
});
app.get('*', function (req, res) {
    res.sendFile(path_1.default.join(__dirname, '../frontend/index.html'));
});
app.listen(port, '0.0.0.0', function () {
    console.log("Server running at http://0.0.0.0:".concat(port));
});
