import swaggerJsdoc from "swagger-jsdoc";

const json = (schema: object) => ({ "application/json": { schema } });
const body = (schema: object) => ({ required: true, content: json(schema) });
const bearer = [{ BearerAuth: [] }];
const unauthorized = { $ref: "#/components/responses/Unauthorized" };
const forbidden = { $ref: "#/components/responses/Forbidden" };
const notFound = { $ref: "#/components/responses/NotFound" };
const serverError = { $ref: "#/components/responses/ServerError" };
const idParameter = (name: string) => ({
  name,
  in: "path",
  required: true,
  schema: { type: "string", format: "uuid" },
});
const analyticsParameters = [
  { name: "period", in: "query", schema: { type: "string", enum: ["today", "last7", "last30", "last90", "thisYear", "custom"], default: "last30" } },
  { name: "startDate", in: "query", schema: { type: "string", format: "date" }, description: "Required with endDate for a custom date range; maximum 366 days." },
  { name: "endDate", in: "query", schema: { type: "string", format: "date" } },
  { name: "groupBy", in: "query", schema: { type: "string", enum: ["daily", "weekly", "monthly"] } },
  { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
  { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
  { name: "search", in: "query", schema: { type: "string", maxLength: 160 } },
  { name: "vendorId", in: "query", schema: { type: "string", format: "uuid" } },
  { name: "categoryId", in: "query", schema: { type: "string", format: "uuid" } },
  { name: "vendorStatus", in: "query", schema: { type: "string", enum: ["ACTIVE", "PENDING", "SUSPENDED"] } },
  { name: "verificationStatus", in: "query", schema: { type: "string", enum: ["NOT_SUBMITTED", "PENDING", "APPROVED", "REJECTED"] } },
  { name: "productStatus", in: "query", schema: { type: "string", enum: ["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"] } },
  { name: "listingStatus", in: "query", schema: { type: "string", enum: ["PENDING", "APPROVED", "REJECTED"] } },
  { name: "orderStatus", in: "query", schema: { type: "string", enum: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"] } },
  { name: "paymentStatus", in: "query", schema: { type: "string", enum: ["PENDING", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"] } },
  { name: "stockStatus", in: "query", schema: { type: "string", enum: ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"] } },
];

const definition: swaggerJsdoc.OAS3Definition = {
  openapi: "3.0.3",
  info: {
    title: "Motova Marketplace API",
    version: "1.0.0",
    description: "REST API for the Motova marketplace. Log in as an admin or vendor, then use Authorize to provide the returned JWT. Admin and vendor protected routes enforce their respective roles.",
  },
  servers: [{
    url: process.env.API_BASE_URL || "http://localhost:5000/api/v1",
    description: "Set API_BASE_URL to the deployed API base URL, including /api/v1.",
  }],
  tags: [
    { name: "Health", description: "API and database health." },
    { name: "Authentication", description: "Vendor and admin authentication." },
    { name: "Admin", description: "Admin dashboard, product review, and vendor management." },
    { name: "Admin Analytics", description: "Marketplace-wide sales, vendor, product, customer, and inventory analytics." },
    { name: "Admin Documents", description: "Admin-only access and review for vendor documents." },
    { name: "Vendor", description: "Vendor dashboard, products, and documents." },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT returned by a login endpoint.",
      },
    },
    schemas: {
      ApiError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
          code: { type: "string", nullable: true },
          errors: { type: "array", items: { type: "object", properties: { field: { type: "string" }, message: { type: "string" } } } },
        },
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password" },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string" },
          token: { type: "string" },
          user: { type: "object", properties: { id: { type: "string" }, name: { type: "string" }, email: { type: "string" }, mobile: { type: "string" }, role: { type: "string", enum: ["ADMIN", "VENDOR"] }, status: { type: "string", enum: ["ACTIVE", "PENDING", "SUSPENDED"] } } },
        },
      },
      SuccessResponse: {
        type: "object",
        properties: { success: { type: "boolean", example: true }, message: { type: "string" }, data: { type: "object", nullable: true } },
      },
      CreateVendorInput: {
        type: "object",
        required: ["name", "email", "mobile", "businessName", "businessAddress"],
        properties: {
          name: { type: "string", minLength: 2, maxLength: 100 },
          email: { type: "string", format: "email" },
          mobile: { type: "string", pattern: "^\\+?[1-9]\\d{7,14}$" },
          businessName: { type: "string", minLength: 2, maxLength: 150 },
          gstNumber: { type: "string", pattern: "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$", description: "Optional 15-character Indian GSTIN." },
          businessAddress: { type: "string", minLength: 5, maxLength: 500 },
          shippingAddress: { type: "string", maxLength: 500 },
          storeManager: { type: "string", maxLength: 100 },
          authorizedPerson: { type: "string", maxLength: 100 },
        },
      },
      VendorListItem: {
        type: "object",
        properties: {
          id: { type: "string" }, name: { type: "string" }, email: { type: "string" }, mobile: { type: "string" },
          status: { type: "string", enum: ["ACTIVE", "PENDING", "SUSPENDED"] }, createdAt: { type: "string", format: "date-time" },
          vendorProfile: { type: "object", nullable: true, properties: {
            id: { type: "string" }, businessName: { type: "string", nullable: true }, gstNumber: { type: "string", nullable: true },
            mobileVerified: { type: "boolean" }, verificationStatus: { type: "string", enum: ["NOT_SUBMITTED", "PENDING", "APPROVED", "REJECTED"] },
          } },
        },
      },
      ReviewInput: {
        type: "object",
        required: ["decision"],
        properties: {
          decision: { type: "string", enum: ["APPROVED", "REJECTED"] },
          note: { type: "string", description: "Required when rejecting." },
        },
      },
      VendorProductInput: {
        type: "object",
        required: ["categoryId", "name", "sku", "price"],
        properties: {
          categoryId: { type: "string" }, brandId: { type: "string", nullable: true },
          name: { type: "string", minLength: 2 }, description: { type: "string", nullable: true }, sku: { type: "string" },
          price: { type: "number", minimum: 0.01 }, compareAtPrice: { type: "number", nullable: true }, stockQuantity: { type: "integer", minimum: 0, default: 0 },
        },
      },
      VendorDocument: {
        type: "object",
        properties: {
          id: { type: "string" }, type: { type: "string", enum: ["GST_CERTIFICATE", "PAN_CARD", "BUSINESS_LICENSE", "IDENTITY_PROOF", "ADDRESS_PROOF", "OTHER"] },
          fileName: { type: "string" }, mimeType: { type: "string", nullable: true }, fileSize: { type: "integer", nullable: true },
          status: { type: "string", enum: ["PENDING", "APPROVED", "REJECTED"] }, rejectionReason: { type: "string", nullable: true }, submittedAt: { type: "string", format: "date-time" },
        },
      },
      AdminVendorDetails: {
        type: "object",
        properties: {
          id: { type: "string" }, name: { type: "string" }, email: { type: "string", format: "email" }, mobile: { type: "string" },
          role: { type: "string", enum: ["VENDOR"] }, status: { type: "string", enum: ["ACTIVE", "PENDING", "SUSPENDED"] },
          createdAt: { type: "string", format: "date-time" }, updatedAt: { type: "string", format: "date-time" },
          vendorProfile: { type: "object", nullable: true, properties: {
            id: { type: "string" }, businessName: { type: "string", nullable: true }, gstNumber: { type: "string", nullable: true },
            businessAddress: { type: "string", nullable: true }, shippingAddress: { type: "string", nullable: true },
            storeManager: { type: "string", nullable: true }, authorizedPerson: { type: "string", nullable: true }, mobileVerified: { type: "boolean" },
            verificationStatus: { type: "string", enum: ["NOT_SUBMITTED", "PENDING", "APPROVED", "REJECTED"] },
            verificationNote: { type: "string", nullable: true }, verifiedAt: { type: "string", format: "date-time", nullable: true },
            documents: { type: "array", items: { $ref: "#/components/schemas/VendorDocument" } },
          } },
        },
      },
      CreateVendorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string" },
          data: { type: "object", properties: { vendor: { type: "object" }, temporaryPassword: { type: "string" } } },
        },
      },
    },
    responses: {
      Unauthorized: { description: "Missing or invalid bearer token.", content: json({ $ref: "#/components/schemas/ApiError" }) },
      Forbidden: { description: "Authenticated account does not have the required role or access.", content: json({ $ref: "#/components/schemas/ApiError" }) },
      NotFound: { description: "The requested resource was not found.", content: json({ $ref: "#/components/schemas/ApiError" }) },
      ServerError: { description: "Unexpected server error.", content: json({ $ref: "#/components/schemas/ApiError" }) },
    },
  },
  paths: {
    "/health": {
      get: { tags: ["Health"], summary: "Check API health", security: [], responses: { "200": { description: "API is running." } } },
    },
    "/health/db": {
      get: { tags: ["Health"], summary: "Check database connectivity", security: [], responses: { "200": { description: "Database is reachable." }, "500": serverError } },
    },
    "/auth/vendor/register": {
      post: {
        tags: ["Authentication"], summary: "Register a vendor", security: [],
        requestBody: body({ type: "object", required: ["name", "email", "mobile", "password"], properties: { name: { type: "string", minLength: 2 }, email: { type: "string", format: "email" }, mobile: { type: "string", minLength: 10 }, password: { type: "string", minLength: 6, format: "password" } } }),
        responses: { "201": { description: "Vendor registered.", content: json({ $ref: "#/components/schemas/LoginResponse" }) }, "400": { description: "Invalid input." }, "409": { description: "Email or mobile is already registered." }, "500": serverError },
      },
    },
    "/auth/vendor/login": {
      post: { tags: ["Authentication"], summary: "Log in as vendor", security: [], requestBody: body({ $ref: "#/components/schemas/LoginInput" }), responses: { "200": { description: "Vendor login successful.", content: json({ $ref: "#/components/schemas/LoginResponse" }) }, "400": { description: "Invalid login data." }, "401": { description: "Invalid credentials." }, "403": { description: "Vendor account is suspended." }, "500": serverError } },
    },
    "/auth/admin/login": {
      post: { tags: ["Authentication"], summary: "Log in as admin", security: [], requestBody: body({ $ref: "#/components/schemas/LoginInput" }), responses: { "200": { description: "Admin login successful.", content: json({ $ref: "#/components/schemas/LoginResponse" }) }, "400": { description: "Invalid login data." }, "401": { description: "Invalid credentials." }, "403": { description: "Admin account is suspended." }, "500": serverError } },
    },
    "/auth/change-password": {
      patch: { tags: ["Authentication"], summary: "Change vendor password", security: bearer, requestBody: body({ type: "object", required: ["currentPassword", "newPassword", "confirmPassword"], properties: { currentPassword: { type: "string", format: "password" }, newPassword: { type: "string", minLength: 8, maxLength: 128, format: "password" }, confirmPassword: { type: "string", format: "password" } } }), responses: { "200": { description: "Password changed." }, "400": { description: "Invalid password input." }, "401": unauthorized, "403": forbidden, "500": serverError } },
    },
    "/admin/dashboard": {
      get: { tags: ["Admin"], summary: "Get admin dashboard statistics", security: bearer, responses: { "200": { description: "Dashboard statistics.", content: json({ $ref: "#/components/schemas/SuccessResponse" }) }, "401": unauthorized, "403": forbidden, "500": serverError } },
    },
    "/admin/brands": {
      get: {
        tags: ["Admin"], summary: "List brands", description: "Returns a paginated brand list with active status, logo, and associated product count.", security: bearer,
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
          { name: "search", in: "query", schema: { type: "string", maxLength: 120 } },
          { name: "isActive", in: "query", schema: { type: "boolean" } },
          { name: "sortBy", in: "query", schema: { type: "string", enum: ["name", "createdAt"], default: "name" } },
          { name: "sortOrder", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "asc" } },
        ],
        responses: { "200": { description: "Brand page with product counts and pagination metadata." }, "400": { description: "Invalid filters." }, "401": unauthorized, "403": forbidden, "500": serverError },
      },
      post: {
        tags: ["Admin"], summary: "Create a brand", description: "Creates an active brand that vendors can assign to products.", security: bearer,
        requestBody: body({ type: "object", required: ["name", "slug"], additionalProperties: false, properties: { name: { type: "string", minLength: 1, maxLength: 120 }, slug: { type: "string", minLength: 1, maxLength: 120, pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" }, description: { type: "string", nullable: true, maxLength: 5000 }, logoUrl: { type: "string", format: "uri", nullable: true } } }),
        responses: { "201": { description: "Brand created with associated product count." }, "400": { description: "Invalid brand details." }, "401": unauthorized, "403": forbidden, "409": { description: "A brand with this slug already exists." }, "500": serverError },
      },
    },
    "/admin/analytics/overview": {
      get: { tags: ["Admin Analytics"], summary: "Get marketplace analytics overview", security: bearer, parameters: analyticsParameters, responses: { "200": { description: "Range-scoped GMV, recorded commission, order, vendor, customer, product, approval, and chart metrics." }, "400": { description: "Invalid date range or filter." }, "401": unauthorized, "403": forbidden, "500": serverError } },
    },
    "/admin/analytics/sales": {
      get: { tags: ["Admin Analytics"], summary: "Get sales and revenue analytics", description: "GMV is delivered vendor-order subtotal; platform revenue is recorded commission. Refunded payments report fully refunded Payment rows because partial refund amounts are not represented.", security: bearer, parameters: analyticsParameters, responses: { "200": { description: "Sales KPIs, trends, and a paginated transaction list." }, "400": { description: "Invalid date range or filter." }, "401": unauthorized, "403": forbidden, "500": serverError } },
    },
    "/admin/analytics/vendors": {
      get: { tags: ["Admin Analytics"], summary: "Get vendor performance analytics", security: bearer, parameters: analyticsParameters, responses: { "200": { description: "Vendor status, registration growth, and paginated vendor product/order/sales summary." }, "400": { description: "Invalid date range or filter." }, "401": unauthorized, "403": forbidden, "500": serverError } },
    },
    "/admin/analytics/products": {
      get: { tags: ["Admin Analytics"], summary: "Get product performance analytics", security: bearer, parameters: analyticsParameters, responses: { "200": { description: "Product status/approval KPIs, sales charts, and paginated product performance." }, "400": { description: "Invalid date range or filter." }, "401": unauthorized, "403": forbidden, "500": serverError } },
    },
    "/admin/analytics/customers": {
      get: { tags: ["Admin Analytics"], summary: "Get customer analytics", description: "Returning customers have at least two delivered orders in the selected period. Customer table excludes password and authentication fields.", security: bearer, parameters: analyticsParameters, responses: { "200": { description: "Customer growth, completed-order behavior, and paginated customer records." }, "400": { description: "Invalid date range or filter." }, "401": unauthorized, "403": forbidden, "500": serverError } },
    },
    "/admin/analytics/inventory": {
      get: { tags: ["Admin Analytics"], summary: "Get inventory analytics", description: "Stock is reported from Product.stockQuantity. Inventory valuation is null because no product cost field exists.", security: bearer, parameters: analyticsParameters, responses: { "200": { description: "Stock health, movement trends, fast/slow products, and paginated inventory." }, "400": { description: "Invalid date range or filter." }, "401": unauthorized, "403": forbidden, "500": serverError } },
    },
    "/admin/approvals": {
      get: { tags: ["Admin"], summary: "List pending product approvals", security: bearer, responses: { "200": { description: "Pending product approvals." }, "401": unauthorized, "403": forbidden } },
    },
    "/admin/products/{productId}/review": {
      patch: { tags: ["Admin"], summary: "Approve or reject a product listing", security: bearer, parameters: [idParameter("productId")], requestBody: body({ $ref: "#/components/schemas/ReviewInput" }), responses: { "200": { description: "Product review saved." }, "400": { description: "Invalid decision or missing rejection reason." }, "401": unauthorized, "403": forbidden, "404": notFound, "409": { description: "Product was already reviewed." } } },
    },
    "/admin/products": {
      get: { tags: ["Admin"], summary: "List vendor products", description: "Searches product name/SKU, filters by vendor/category/brand/status/approval/stock, and returns vendor, category, brand, images, and pagination metadata.", security: bearer, parameters: [
        { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } }, { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
        { name: "search", in: "query", schema: { type: "string" } }, { name: "vendorId", in: "query", schema: { type: "string", format: "uuid" } },
        { name: "categoryId", in: "query", schema: { type: "string", format: "uuid" } }, { name: "brandId", in: "query", schema: { type: "string", format: "uuid" } },
        { name: "status", in: "query", schema: { type: "string", enum: ["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"] } },
        { name: "listingStatus", in: "query", schema: { type: "string", enum: ["PENDING", "APPROVED", "REJECTED"] } },
        { name: "stockStatus", in: "query", schema: { type: "string", enum: ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"] } },
        { name: "sortBy", in: "query", schema: { type: "string", enum: ["createdAt", "price", "name"], default: "createdAt" } },
        { name: "sortOrder", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "desc" } },
      ], responses: { "200": { description: "Product page with vendor, category, brand, images, and pagination." }, "400": { description: "Invalid filters." }, "401": unauthorized, "403": forbidden } },
    },
    "/admin/products/pending": {
      get: { tags: ["Admin"], summary: "List products waiting for review", security: bearer, parameters: [{ name: "page", in: "query", schema: { type: "integer", minimum: 1 } }, { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } }, { name: "sortOrder", in: "query", schema: { type: "string", enum: ["asc", "desc"] } }], responses: { "200": { description: "Pending products and pagination metadata." }, "400": { description: "Invalid pagination." }, "401": unauthorized, "403": forbidden } },
    },
    "/admin/products/{productId}": {
      get: { tags: ["Admin"], summary: "Get product details", description: "Includes vendor, category parent, brand, images, listing review history, recent inventory movements, and related record counts.", security: bearer, parameters: [idParameter("productId")], responses: { "200": { description: "Complete product details." }, "400": { description: "Invalid product ID." }, "401": unauthorized, "403": forbidden, "404": notFound } },
      patch: { tags: ["Admin"], summary: "Edit vendor product details", description: "Vendor ownership cannot be changed. Changes to approved listing content set the product inactive and return its listing to PENDING. Stock edits create inventory adjustment records.", security: bearer, parameters: [idParameter("productId")], requestBody: body({ type: "object", minProperties: 1, properties: { name: { type: "string", minLength: 2, maxLength: 200 }, description: { type: "string", nullable: true }, categoryId: { type: "string", format: "uuid" }, brandId: { type: "string", format: "uuid", nullable: true }, price: { type: "number", exclusiveMinimum: 0 }, compareAtPrice: { type: "number", exclusiveMinimum: 0, nullable: true }, sku: { type: "string", maxLength: 100 }, slug: { type: "string", maxLength: 180 }, status: { type: "string", enum: ["DRAFT", "ACTIVE", "INACTIVE"] }, stockQuantity: { type: "integer", minimum: 0 } } }), responses: { "200": { description: "Product updated; approved content changes may require review." }, "400": { description: "Invalid fields or missing category/brand." }, "401": unauthorized, "403": forbidden, "404": notFound, "409": { description: "Duplicate SKU/slug or invalid activation." } } },
      delete: { tags: ["Admin"], summary: "Archive a vendor product", description: "Products with historical order items cannot be deleted. Other products are archived; records and relations are preserved.", security: bearer, parameters: [idParameter("productId")], responses: { "200": { description: "Product archived." }, "401": unauthorized, "403": forbidden, "404": notFound, "409": { description: "Product has historical order references." } } },
    },
    "/admin/products/{productId}/approve": {
      patch: { tags: ["Admin"], summary: "Approve a pending product", description: "Writes a ListingReview. Product status becomes ACTIVE only when vendor, category, and brand visibility requirements are satisfied; otherwise it remains INACTIVE.", security: bearer, parameters: [idParameter("productId")], responses: { "200": { description: "Approval recorded." }, "401": unauthorized, "403": forbidden, "404": notFound, "409": { description: "Only pending products can be reviewed." } } },
    },
    "/admin/products/{productId}/reject": {
      patch: { tags: ["Admin"], summary: "Reject a pending product", security: bearer, parameters: [idParameter("productId")], requestBody: body({ type: "object", required: ["reason"], properties: { reason: { type: "string", minLength: 10, maxLength: 2000 } } }), responses: { "200": { description: "Rejection reason and review history saved." }, "400": { description: "A meaningful rejection reason is required." }, "401": unauthorized, "403": forbidden, "404": notFound, "409": { description: "Only pending products can be reviewed." } } },
    },
    "/admin/products/{productId}/status": {
      patch: { tags: ["Admin"], summary: "Activate or deactivate a product", description: "Accepted values are DRAFT, ACTIVE, or INACTIVE. Activation requires an approved listing, active verified vendor, and active category and brand. ARCHIVED is terminal and can only be reached through DELETE.", security: bearer, parameters: [idParameter("productId")], requestBody: body({ type: "object", required: ["status"], properties: { status: { type: "string", enum: ["DRAFT", "ACTIVE", "INACTIVE"] } } }), responses: { "200": { description: "Product status updated." }, "400": { description: "Invalid product status." }, "401": unauthorized, "403": forbidden, "404": notFound, "409": { description: "Product does not satisfy activation requirements." } } },
    },
    "/admin/vendors": {
      get: {
        tags: ["Admin"], summary: "List vendors", security: bearer,
        parameters: [
          { name: "search", in: "query", schema: { type: "string" }, description: "Search name, email, mobile, or business name." },
          { name: "status", in: "query", schema: { type: "string", enum: ["ACTIVE", "PENDING", "SUSPENDED"] } },
          { name: "verificationStatus", in: "query", schema: { type: "string", enum: ["NOT_SUBMITTED", "PENDING", "APPROVED", "REJECTED"] } },
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 10 } },
        ],
        responses: { "200": { description: "Vendor page, with pagination alongside data.", content: json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { type: "array", items: { $ref: "#/components/schemas/VendorListItem" } }, pagination: { type: "object", properties: { currentPage: { type: "integer" }, pageSize: { type: "integer" }, totalVendors: { type: "integer" }, totalPages: { type: "integer" }, hasNextPage: { type: "boolean" }, hasPreviousPage: { type: "boolean" } } } } }) }, "400": { description: "Invalid filters." }, "401": unauthorized, "403": forbidden },
      },
      post: { tags: ["Admin"], summary: "Create a vendor", description: "Creates a pending account and returns a temporary password once.", security: bearer, requestBody: body({ $ref: "#/components/schemas/CreateVendorInput" }), responses: { "201": { description: "Vendor created. Keep the temporary password secure.", content: json({ $ref: "#/components/schemas/CreateVendorResponse" }) }, "400": { description: "Invalid vendor details." }, "409": { description: "Email, mobile, or GSTIN already exists." }, "401": unauthorized, "403": forbidden } },
    },
    "/admin/vendors/{vendorId}": {
      get: { tags: ["Admin"], summary: "Get vendor profile and document metadata", description: "Private file URLs are omitted. Use the admin document access operation for a temporary signed URL.", security: bearer, parameters: [idParameter("vendorId")], responses: { "200": { description: "Vendor profile.", content: json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/AdminVendorDetails" } } }) }, "401": unauthorized, "403": forbidden, "404": notFound } },
    },
    "/admin/vendors/{vendorId}/status": {
      patch: { tags: ["Admin"], summary: "Activate or suspend a vendor account", description: "Account status is independent from document verification status.", security: bearer, parameters: [idParameter("vendorId")], requestBody: body({ type: "object", required: ["status"], properties: { status: { type: "string", enum: ["ACTIVE", "SUSPENDED"] } } }), responses: { "200": { description: "Vendor account status updated." }, "400": { description: "Invalid account status." }, "401": unauthorized, "403": forbidden, "404": notFound } },
    },
    "/admin/categories": {
      get: { tags: ["Admin"], summary: "List and search categories", description: "Returns paginated root categories with nested children and product counts. The status filter applies to both levels.", security: bearer, parameters: [
        { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } }, { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
        { name: "search", in: "query", schema: { type: "string", maxLength: 120 } }, { name: "isActive", in: "query", schema: { type: "boolean" } },
        { name: "parentId", in: "query", schema: { type: "string", format: "uuid" }, description: "Return only children of this root category." },
        { name: "includeChildren", in: "query", schema: { type: "boolean", default: true } },
        { name: "sortBy", in: "query", schema: { type: "string", enum: ["name", "createdAt", "sortOrder"], default: "sortOrder" } },
        { name: "sortOrder", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "asc" } },
      ], responses: { "200": { description: "Category page and pagination metadata." }, "400": { description: "Invalid filters." }, "401": unauthorized, "403": forbidden } },
      post: { tags: ["Admin"], summary: "Create a root category or subcategory", security: bearer, requestBody: body({ type: "object", required: ["name", "slug"], properties: { name: { type: "string", minLength: 1, maxLength: 120 }, slug: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" }, description: { type: "string", nullable: true }, image: { type: "string", nullable: true, description: "HTTPS URL or uploaded r2://category-images reference." }, parentId: { type: "string", format: "uuid", nullable: true }, sortOrder: { type: "integer", minimum: 0 } } }), responses: { "201": { description: "Category created." }, "400": { description: "Invalid category or parent." }, "401": unauthorized, "403": forbidden, "404": notFound, "409": { description: "Slug already exists." } } },
    },
    "/admin/categories/stats": {
      get: { tags: ["Admin"], summary: "Get category summary totals", security: bearer, responses: { "200": { description: "Total, active, inactive, parent, and subcategory counts." }, "401": unauthorized, "403": forbidden } },
    },
    "/admin/categories/image": {
      post: { tags: ["Admin"], summary: "Upload a category image", description: "Uploads a JPG, PNG, or WebP image up to 5 MB to R2 and returns its storage reference and temporary signed URL.", security: bearer, requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", required: ["image"], properties: { image: { type: "string", format: "binary" } } } } } }, responses: { "201": { description: "Image uploaded." }, "400": { description: "Missing or invalid image." }, "401": unauthorized, "403": forbidden } },
    },
    "/admin/categories/{categoryId}": {
      get: { tags: ["Admin"], summary: "Get category details", security: bearer, parameters: [idParameter("categoryId")], responses: { "200": { description: "Category, parent, children, and product count." }, "400": { description: "Invalid category ID." }, "401": unauthorized, "403": forbidden, "404": notFound } },
      patch: { tags: ["Admin"], summary: "Update category details", description: "Null clears description, image, or parentId. Parent changes cannot create cycles or a hierarchy deeper than one child level.", security: bearer, parameters: [idParameter("categoryId")], requestBody: body({ type: "object", minProperties: 1, properties: { name: { type: "string", minLength: 1, maxLength: 120 }, slug: { type: "string" }, description: { type: "string", nullable: true }, image: { type: "string", nullable: true, description: "HTTPS URL or uploaded r2://category-images reference." }, parentId: { type: "string", format: "uuid", nullable: true }, sortOrder: { type: "integer", minimum: 0 }, isActive: { type: "boolean" } } }), responses: { "200": { description: "Category updated." }, "400": { description: "Invalid fields or hierarchy." }, "401": unauthorized, "403": forbidden, "404": notFound, "409": { description: "Duplicate slug or referenced category conflict." } } },
      delete: { tags: ["Admin"], summary: "Delete an empty category", description: "Deletion is rejected if products or subcategories still reference the category.", security: bearer, parameters: [idParameter("categoryId")], responses: { "200": { description: "Category deleted." }, "401": unauthorized, "403": forbidden, "404": notFound, "409": { description: "Category contains products or subcategories." } } },
    },
    "/admin/categories/{categoryId}/status": {
      patch: { tags: ["Admin"], summary: "Activate or deactivate a category", description: "Existing products remain associated. Vendors can create listings only in active subcategories whose root parent is also active.", security: bearer, parameters: [idParameter("categoryId")], requestBody: body({ type: "object", required: ["isActive"], properties: { isActive: { type: "boolean" } } }), responses: { "200": { description: "Category status updated." }, "400": { description: "isActive must be a boolean." }, "401": unauthorized, "403": forbidden, "404": notFound } },
    },
    "/admin/documents/{documentId}/access": {
      get: { tags: ["Admin Documents"], summary: "Generate temporary access to a vendor document", security: bearer, parameters: [idParameter("documentId")], responses: { "200": { description: "Signed URL valid for five minutes.", content: json({ type: "object", properties: { success: { type: "boolean" }, data: { type: "object", properties: { url: { type: "string", format: "uri" }, expiresIn: { type: "integer", example: 300 } } } } }) }, "401": unauthorized, "403": forbidden, "404": notFound, "409": { description: "No usable storage reference was found." } } },
    },
    "/admin/documents/{documentId}/review": {
      patch: { tags: ["Admin Documents"], summary: "Approve or reject a vendor document", security: bearer, parameters: [idParameter("documentId")], requestBody: { ...body({ type: "object", required: ["decision"], properties: { decision: { type: "string", enum: ["APPROVED", "REJECTED"] }, note: { type: "string", maxLength: 1000, description: "Required for rejection." } } }), content: { "application/json": { schema: { $ref: "#/components/schemas/ReviewInput" }, examples: { approve: { value: { decision: "APPROVED" } }, reject: { value: { decision: "REJECTED", note: "Document is unreadable." } } } } } }, responses: { "200": { description: "Review saved; verification is recalculated for GST/PAN documents." }, "400": { description: "Invalid decision or missing rejection reason." }, "401": unauthorized, "403": forbidden, "404": notFound } },
    },
    "/vendor/dashboard": {
      get: { tags: ["Vendor"], summary: "Get vendor dashboard statistics", security: bearer, parameters: [{ name: "rangeDays", in: "query", schema: { type: "integer", enum: [7, 30, 90], default: 30 } }], responses: { "200": { description: "Vendor dashboard data." }, "401": unauthorized, "403": forbidden, "404": notFound } },
    },
    "/vendor/products": {
      get: { tags: ["Vendor"], summary: "List vendor products", security: bearer, responses: { "200": { description: "Vendor product list." }, "401": unauthorized, "403": forbidden } },
      post: { tags: ["Vendor"], summary: "Create a product listing", description: "Creates a product in pending review status.", security: bearer, requestBody: body({ $ref: "#/components/schemas/VendorProductInput" }), responses: { "201": { description: "Product created and queued for review." }, "400": { description: "Invalid product data." }, "401": unauthorized, "403": forbidden, "409": { description: "SKU already exists for this vendor." } } },
    },
    "/vendor/categories": {
      get: { tags: ["Vendor"], summary: "List selectable active categories", description: "Returns active subcategories whose root parent is also active.", security: bearer, responses: { "200": { description: "Categories available for new product listings." }, "401": unauthorized, "403": forbidden } },
    },
    "/vendor/documents": {
      post: {
        tags: ["Vendor"], summary: "Upload vendor documents", security: bearer,
        description: "Upload up to six PDF/JPG/PNG files (5 MB maximum each). Send documentTypes as a JSON array string with one type per file, in the same order. The accepted file field is `documents`.",
        requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", required: ["documents", "documentTypes"], properties: { documents: { type: "array", maxItems: 6, items: { type: "string", format: "binary" } }, documentTypes: { type: "string", example: "[\\\"GST_CERTIFICATE\\\",\\\"PAN_CARD\\\"]", description: "Allowed values: GST_CERTIFICATE, PAN_CARD, BUSINESS_LICENSE, IDENTITY_PROOF, ADDRESS_PROOF, OTHER." } } } } } },
        responses: { "201": { description: "Documents uploaded." }, "400": { description: "Invalid multipart form or document types." }, "401": unauthorized, "403": forbidden, "413": { description: "A file exceeds 5 MB." } },
      },
    },
    "/vendor/documents/{documentId}/access": {
      get: { tags: ["Vendor"], summary: "Generate temporary access to an owned document", security: bearer, parameters: [idParameter("documentId")], responses: { "200": { description: "Signed URL valid for five minutes." }, "401": unauthorized, "403": forbidden, "404": notFound } },
    },
  },
};

const swaggerSpec = swaggerJsdoc({ definition, apis: [] });

export default swaggerSpec;
