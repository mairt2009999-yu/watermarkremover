import { pgTable, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull(),
	image: text('image'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	role: text('role'),
	banned: boolean('banned'),
	banReason: text('ban_reason'),
	banExpires: timestamp('ban_expires'),
	customerId: text('customer_id'),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	impersonatedBy: text('impersonated_by')
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at'),
	updatedAt: timestamp('updated_at')
});

export const payment = pgTable("payment", {
	id: text("id").primaryKey(),
	priceId: text('price_id').notNull(),
	type: text('type').notNull(),
	interval: text('interval'),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	customerId: text('customer_id').notNull(),
	subscriptionId: text('subscription_id'),
	status: text('status').notNull(),
	periodStart: timestamp('period_start'),
	periodEnd: timestamp('period_end'),
	cancelAtPeriodEnd: boolean('cancel_at_period_end'),
	trialStart: timestamp('trial_start'),
	trialEnd: timestamp('trial_end'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Credit System Tables (Simplified - Subscription Only)
export const userCredits = pgTable("user_credits", {
	id: text("id").primaryKey(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }).unique(),
	balance: integer('balance').notNull().default(0),
	monthlyAllocation: integer('monthly_allocation').notNull().default(0),
	lastResetDate: timestamp('last_reset_date'),
	totalEarned: integer('total_earned').notNull().default(0),
	totalSpent: integer('total_spent').notNull().default(0),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const creditTransactions = pgTable("credit_transactions", {
	id: text("id").primaryKey(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	amount: integer('amount').notNull(),
	balanceAfter: integer('balance_after').notNull(),
	type: text('type').notNull(), // 'earned', 'spent', 'expired', 'refunded', 'bonus'
	reason: text('reason').notNull(),
	featureUsed: text('feature_used'), // 'watermark_removal', 'batch_process', etc.
	metadata: jsonb('metadata'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const subscriptionCreditConfig = pgTable("subscription_credit_config", {
	id: text("id").primaryKey(),
	planId: text('plan_id').notNull().unique(),
	monthlyCredits: integer('monthly_credits').notNull(),
	rolloverEnabled: boolean('rollover_enabled').default(false),
	createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const creditPackages = pgTable("credit_packages", {
	id: text("id").primaryKey(),
	name: text('name').notNull(),
	credits: integer('credits').notNull(),
	price: integer('price').notNull(), // in cents
	currency: text('currency').notNull().default('usd'),
	active: boolean('active').notNull().default(true),
	sortOrder: integer('sort_order').notNull().default(0),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const creditPurchases = pgTable("credit_purchases", {
	id: text("id").primaryKey(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	packageId: text('package_id').notNull().references(() => creditPackages.id),
	credits: integer('credits').notNull(),
	amount: integer('amount').notNull(), // in cents
	currency: text('currency').notNull(),
	stripePaymentId: text('stripe_payment_id'),
	status: text('status').notNull().default('pending'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
