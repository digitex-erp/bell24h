-- Database Verification Queries for Bell24h Seeding
-- Run these queries to verify the seed script worked correctly

-- 1. Check supplier count
SELECT COUNT(*) as supplier_count 
FROM users 
WHERE type = 'SUPPLIER';
-- Expected: 50

-- 2. Check buyer count  
SELECT COUNT(*) as buyer_count 
FROM users 
WHERE type = 'BUYER';
-- Expected: 20

-- 3. Check RFQ count with status breakdown
SELECT 
    status,
    COUNT(*) as count
FROM rfqs 
GROUP BY status;
-- Expected: 30 total (mostly ACTIVE)

-- 4. Check quote count with status breakdown
SELECT 
    status,
    COUNT(*) as count
FROM quotes 
GROUP BY status;
-- Expected: 50 total

-- 5. Check categories count
SELECT COUNT(*) as categories_count 
FROM categories;
-- Expected: 50

-- 6. Check messages count
SELECT COUNT(*) as messages_count 
FROM messages;
-- Expected: 100

-- 7. Check payments count
SELECT COUNT(*) as payments_count 
FROM payments;
-- Expected: 25

-- 8. Sample supplier data verification
SELECT 
    id,
    email,
    name,
    companyName,
    city,
    state,
    verified,
    rating,
    completedOrders,
    gstNumber,
    phone
FROM users 
WHERE type = 'SUPPLIER' 
ORDER BY id 
LIMIT 5;

-- 9. Sample buyer data verification
SELECT 
    id,
    email,
    name,
    companyName,
    city,
    state,
    verified,
    rating,
    completedOrders,
    gstNumber,
    phone
FROM users 
WHERE type = 'BUYER' 
ORDER BY id 
LIMIT 5;

-- 10. Sample RFQ data with realistic titles
SELECT 
    id,
    title,
    quantity,
    unit,
    targetPrice,
    deadline,
    status,
    deliveryLocation,
    buyerId
FROM rfqs 
ORDER BY id 
LIMIT 5;

-- 11. Sample quote data with pricing
SELECT 
    q.id,
    q.unitPrice,
    q.totalPrice,
    q.quantity,
    q.deliveryTime,
    q.status,
    q.rfqId,
    q.supplierId,
    u.companyName as supplier_name
FROM quotes q
JOIN users u ON q.supplierId = u.id
ORDER BY q.id 
LIMIT 5;

-- 12. Check message content for Hindi-English mix
SELECT 
    id,
    content,
    senderId,
    receiverId,
    rfqId,
    createdAt
FROM messages 
WHERE content LIKE '%hai%' OR content LIKE '%kya%' OR content LIKE '%sakte%'
ORDER BY RANDOM()
LIMIT 5;

-- 13. Verify GST number format (should be 27XXXXX1234XXX format)
SELECT 
    id,
    email,
    companyName,
    gstNumber,
    CASE 
        WHEN gstNumber LIKE '27%' AND LENGTH(gstNumber) = 15 THEN 'Valid Format'
        ELSE 'Check Format'
    END as gst_validation
FROM users 
WHERE type IN ('SUPPLIER', 'BUYER')
LIMIT 10;

-- 14. Check phone number format (should start with +91 and 10 digits)
SELECT 
    id,
    email,
    phone,
    CASE 
        WHEN phone LIKE '+91%' AND LENGTH(phone) = 13 THEN 'Valid Format'
        ELSE 'Check Format'
    END as phone_validation
FROM users 
LIMIT 10;

-- 15. Verify email patterns
SELECT 
    id,
    email,
    type,
    CASE 
        WHEN email LIKE 'supplier%@bell24h.com' AND type = 'SUPPLIER' THEN 'Supplier Pattern OK'
        WHEN email LIKE 'buyer%@bell24h.com' AND type = 'BUYER' THEN 'Buyer Pattern OK'
        ELSE 'Check Pattern'
    END as email_validation
FROM users 
ORDER BY type, id
LIMIT 10;

-- 16. Check verification percentages
SELECT 
    type,
    verified,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY type), 2) as percentage
FROM users 
GROUP BY type, verified
ORDER BY type, verified;

-- 17. Check rating distribution
SELECT 
    type,
    ROUND(rating, 1) as rating,
    COUNT(*) as count
FROM users 
GROUP BY type, ROUND(rating, 1)
ORDER BY type, rating DESC;

-- 18. Check city distribution for suppliers
SELECT 
    city,
    state,
    COUNT(*) as supplier_count
FROM users 
WHERE type = 'SUPPLIER'
GROUP BY city, state
ORDER BY supplier_count DESC
LIMIT 10;

-- 19. Check city distribution for buyers
SELECT 
    city,
    state,
    COUNT(*) as buyer_count
FROM users 
WHERE type = 'BUYER'
GROUP BY city, state
ORDER BY buyer_count DESC
LIMIT 10;

-- 20. Check RFQ deadline distribution (should be 7-30 days from creation)
SELECT 
    id,
    title,
    deadline,
    createdAt,
    JULIANDAY(deadline) - JULIANDAY(createdAt) as days_until_deadline
FROM rfqs 
WHERE JULIANDAY(deadline) - JULIANDAY(createdAt) BETWEEN 7 AND 30
LIMIT 5;

-- 21. Check quote pricing vs target price
SELECT 
    r.id as rfq_id,
    r.title,
    r.targetPrice,
    q.unitPrice,
    q.supplierId,
    ROUND((q.unitPrice - r.targetPrice) * 100.0 / r.targetPrice, 2) as price_difference_percent
FROM rfqs r
JOIN quotes q ON r.id = q.rfqId
LIMIT 5;

-- 22. Verify completed orders range (0-100 for suppliers)
SELECT 
    MIN(completedOrders) as min_orders,
    MAX(completedOrders) as max_orders,
    AVG(completedOrders) as avg_orders
FROM users 
WHERE type = 'SUPPLIER';

-- 23. Check message sender/receiver relationships
SELECT 
    m.id,
    m.content,
    s.type as sender_type,
    s.companyName as sender_company,
    r.type as receiver_type,
    r.companyName as receiver_company
FROM messages m
JOIN users s ON m.senderId = s.id
JOIN users r ON m.receiverId = r.id
WHERE s.type != r.type
LIMIT 5;

-- 24. Check payment status distribution
SELECT 
    status,
    COUNT(*) as count,
    SUM(amount) as total_amount
FROM payments 
GROUP BY status;

-- 25. Overall data integrity check
SELECT 
    'Suppliers' as entity_type,
    COUNT(*) as count,
    '50' as expected
FROM users WHERE type = 'SUPPLIER'
UNION ALL
SELECT 
    'Buyers' as entity_type,
    COUNT(*) as count,
    '20' as expected
FROM users WHERE type = 'BUYER'
UNION ALL
SELECT 
    'RFQs' as entity_type,
    COUNT(*) as count,
    '30' as expected
FROM rfqs
UNION ALL
SELECT 
    'Quotes' as entity_type,
    COUNT(*) as count,
    '50' as expected
FROM quotes
UNION ALL
SELECT 
    'Messages' as entity_type,
    COUNT(*) as count,
    '100' as expected
FROM messages
UNION ALL
SELECT 
    'Categories' as entity_type,
    COUNT(*) as count,
    '50' as expected
FROM categories
UNION ALL
SELECT 
    'Payments' as entity_type,
    COUNT(*) as count,
    '25' as expected
FROM payments;