
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Company
 * 
 */
export type Company = $Result.DefaultSelection<Prisma.$CompanyPayload>
/**
 * Model Product
 * 
 */
export type Product = $Result.DefaultSelection<Prisma.$ProductPayload>
/**
 * Model RFQ
 * 
 */
export type RFQ = $Result.DefaultSelection<Prisma.$RFQPayload>
/**
 * Model Bid
 * 
 */
export type Bid = $Result.DefaultSelection<Prisma.$BidPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Role: {
  ADMIN: 'ADMIN',
  BUYER: 'BUYER',
  SUPPLIER: 'SUPPLIER'
};

export type Role = (typeof Role)[keyof typeof Role]


export const RFQStatus: {
  DRAFT: 'DRAFT',
  OPEN: 'OPEN',
  IN_REVIEW: 'IN_REVIEW',
  AWARDED: 'AWARDED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED'
};

export type RFQStatus = (typeof RFQStatus)[keyof typeof RFQStatus]


export const BidStatus: {
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN'
};

export type BidStatus = (typeof BidStatus)[keyof typeof BidStatus]


export const Visibility: {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
  INVITED: 'INVITED'
};

export type Visibility = (typeof Visibility)[keyof typeof Visibility]

}

export type Role = $Enums.Role

export const Role: typeof $Enums.Role

export type RFQStatus = $Enums.RFQStatus

export const RFQStatus: typeof $Enums.RFQStatus

export type BidStatus = $Enums.BidStatus

export const BidStatus: typeof $Enums.BidStatus

export type Visibility = $Enums.Visibility

export const Visibility: typeof $Enums.Visibility

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.company`: Exposes CRUD operations for the **Company** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Companies
    * const companies = await prisma.company.findMany()
    * ```
    */
  get company(): Prisma.CompanyDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.product`: Exposes CRUD operations for the **Product** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Products
    * const products = await prisma.product.findMany()
    * ```
    */
  get product(): Prisma.ProductDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.rFQ`: Exposes CRUD operations for the **RFQ** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RFQS
    * const rFQS = await prisma.rFQ.findMany()
    * ```
    */
  get rFQ(): Prisma.RFQDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.bid`: Exposes CRUD operations for the **Bid** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Bids
    * const bids = await prisma.bid.findMany()
    * ```
    */
  get bid(): Prisma.BidDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.7.0
   * Query Engine version: 3cff47a7f5d65c3ea74883f1d736e41d68ce91ed
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Company: 'Company',
    Product: 'Product',
    RFQ: 'RFQ',
    Bid: 'Bid'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "company" | "product" | "rFQ" | "bid"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Company: {
        payload: Prisma.$CompanyPayload<ExtArgs>
        fields: Prisma.CompanyFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CompanyFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CompanyFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>
          }
          findFirst: {
            args: Prisma.CompanyFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CompanyFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>
          }
          findMany: {
            args: Prisma.CompanyFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>[]
          }
          create: {
            args: Prisma.CompanyCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>
          }
          createMany: {
            args: Prisma.CompanyCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CompanyCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>[]
          }
          delete: {
            args: Prisma.CompanyDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>
          }
          update: {
            args: Prisma.CompanyUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>
          }
          deleteMany: {
            args: Prisma.CompanyDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CompanyUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CompanyUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>[]
          }
          upsert: {
            args: Prisma.CompanyUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>
          }
          aggregate: {
            args: Prisma.CompanyAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCompany>
          }
          groupBy: {
            args: Prisma.CompanyGroupByArgs<ExtArgs>
            result: $Utils.Optional<CompanyGroupByOutputType>[]
          }
          count: {
            args: Prisma.CompanyCountArgs<ExtArgs>
            result: $Utils.Optional<CompanyCountAggregateOutputType> | number
          }
        }
      }
      Product: {
        payload: Prisma.$ProductPayload<ExtArgs>
        fields: Prisma.ProductFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProductFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProductFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          findFirst: {
            args: Prisma.ProductFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProductFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          findMany: {
            args: Prisma.ProductFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          create: {
            args: Prisma.ProductCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          createMany: {
            args: Prisma.ProductCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProductCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          delete: {
            args: Prisma.ProductDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          update: {
            args: Prisma.ProductUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          deleteMany: {
            args: Prisma.ProductDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProductUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ProductUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          upsert: {
            args: Prisma.ProductUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          aggregate: {
            args: Prisma.ProductAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProduct>
          }
          groupBy: {
            args: Prisma.ProductGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProductGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProductCountArgs<ExtArgs>
            result: $Utils.Optional<ProductCountAggregateOutputType> | number
          }
        }
      }
      RFQ: {
        payload: Prisma.$RFQPayload<ExtArgs>
        fields: Prisma.RFQFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RFQFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RFQPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RFQFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RFQPayload>
          }
          findFirst: {
            args: Prisma.RFQFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RFQPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RFQFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RFQPayload>
          }
          findMany: {
            args: Prisma.RFQFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RFQPayload>[]
          }
          create: {
            args: Prisma.RFQCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RFQPayload>
          }
          createMany: {
            args: Prisma.RFQCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RFQCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RFQPayload>[]
          }
          delete: {
            args: Prisma.RFQDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RFQPayload>
          }
          update: {
            args: Prisma.RFQUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RFQPayload>
          }
          deleteMany: {
            args: Prisma.RFQDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RFQUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RFQUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RFQPayload>[]
          }
          upsert: {
            args: Prisma.RFQUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RFQPayload>
          }
          aggregate: {
            args: Prisma.RFQAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRFQ>
          }
          groupBy: {
            args: Prisma.RFQGroupByArgs<ExtArgs>
            result: $Utils.Optional<RFQGroupByOutputType>[]
          }
          count: {
            args: Prisma.RFQCountArgs<ExtArgs>
            result: $Utils.Optional<RFQCountAggregateOutputType> | number
          }
        }
      }
      Bid: {
        payload: Prisma.$BidPayload<ExtArgs>
        fields: Prisma.BidFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BidFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BidPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BidFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BidPayload>
          }
          findFirst: {
            args: Prisma.BidFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BidPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BidFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BidPayload>
          }
          findMany: {
            args: Prisma.BidFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BidPayload>[]
          }
          create: {
            args: Prisma.BidCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BidPayload>
          }
          createMany: {
            args: Prisma.BidCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BidCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BidPayload>[]
          }
          delete: {
            args: Prisma.BidDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BidPayload>
          }
          update: {
            args: Prisma.BidUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BidPayload>
          }
          deleteMany: {
            args: Prisma.BidDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BidUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BidUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BidPayload>[]
          }
          upsert: {
            args: Prisma.BidUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BidPayload>
          }
          aggregate: {
            args: Prisma.BidAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBid>
          }
          groupBy: {
            args: Prisma.BidGroupByArgs<ExtArgs>
            result: $Utils.Optional<BidGroupByOutputType>[]
          }
          count: {
            args: Prisma.BidCountArgs<ExtArgs>
            result: $Utils.Optional<BidCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    company?: CompanyOmit
    product?: ProductOmit
    rFQ?: RFQOmit
    bid?: BidOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    createdRfqs: number
    bids: number
    invitedToRfqs: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdRfqs?: boolean | UserCountOutputTypeCountCreatedRfqsArgs
    bids?: boolean | UserCountOutputTypeCountBidsArgs
    invitedToRfqs?: boolean | UserCountOutputTypeCountInvitedToRfqsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountCreatedRfqsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RFQWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountBidsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BidWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountInvitedToRfqsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RFQWhereInput
  }


  /**
   * Count Type CompanyCountOutputType
   */

  export type CompanyCountOutputType = {
    users: number
    products: number
  }

  export type CompanyCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | CompanyCountOutputTypeCountUsersArgs
    products?: boolean | CompanyCountOutputTypeCountProductsArgs
  }

  // Custom InputTypes
  /**
   * CompanyCountOutputType without action
   */
  export type CompanyCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompanyCountOutputType
     */
    select?: CompanyCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CompanyCountOutputType without action
   */
  export type CompanyCountOutputTypeCountUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }

  /**
   * CompanyCountOutputType without action
   */
  export type CompanyCountOutputTypeCountProductsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductWhereInput
  }


  /**
   * Count Type RFQCountOutputType
   */

  export type RFQCountOutputType = {
    invitedSuppliers: number
    bids: number
  }

  export type RFQCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    invitedSuppliers?: boolean | RFQCountOutputTypeCountInvitedSuppliersArgs
    bids?: boolean | RFQCountOutputTypeCountBidsArgs
  }

  // Custom InputTypes
  /**
   * RFQCountOutputType without action
   */
  export type RFQCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RFQCountOutputType
     */
    select?: RFQCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * RFQCountOutputType without action
   */
  export type RFQCountOutputTypeCountInvitedSuppliersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }

  /**
   * RFQCountOutputType without action
   */
  export type RFQCountOutputTypeCountBidsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BidWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    password: string | null
    role: $Enums.Role | null
    isEmailVerified: boolean | null
    verificationToken: string | null
    resetPasswordToken: string | null
    resetPasswordExpires: Date | null
    lastLoginAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    companyId: string | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    password: string | null
    role: $Enums.Role | null
    isEmailVerified: boolean | null
    verificationToken: string | null
    resetPasswordToken: string | null
    resetPasswordExpires: Date | null
    lastLoginAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    companyId: string | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    name: number
    password: number
    role: number
    isEmailVerified: number
    verificationToken: number
    resetPasswordToken: number
    resetPasswordExpires: number
    lastLoginAt: number
    createdAt: number
    updatedAt: number
    companyId: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    name?: true
    password?: true
    role?: true
    isEmailVerified?: true
    verificationToken?: true
    resetPasswordToken?: true
    resetPasswordExpires?: true
    lastLoginAt?: true
    createdAt?: true
    updatedAt?: true
    companyId?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    name?: true
    password?: true
    role?: true
    isEmailVerified?: true
    verificationToken?: true
    resetPasswordToken?: true
    resetPasswordExpires?: true
    lastLoginAt?: true
    createdAt?: true
    updatedAt?: true
    companyId?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    name?: true
    password?: true
    role?: true
    isEmailVerified?: true
    verificationToken?: true
    resetPasswordToken?: true
    resetPasswordExpires?: true
    lastLoginAt?: true
    createdAt?: true
    updatedAt?: true
    companyId?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    name: string
    password: string
    role: $Enums.Role
    isEmailVerified: boolean
    verificationToken: string | null
    resetPasswordToken: string | null
    resetPasswordExpires: Date | null
    lastLoginAt: Date | null
    createdAt: Date
    updatedAt: Date
    companyId: string
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    role?: boolean
    isEmailVerified?: boolean
    verificationToken?: boolean
    resetPasswordToken?: boolean
    resetPasswordExpires?: boolean
    lastLoginAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    companyId?: boolean
    company?: boolean | CompanyDefaultArgs<ExtArgs>
    createdRfqs?: boolean | User$createdRfqsArgs<ExtArgs>
    bids?: boolean | User$bidsArgs<ExtArgs>
    invitedToRfqs?: boolean | User$invitedToRfqsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    role?: boolean
    isEmailVerified?: boolean
    verificationToken?: boolean
    resetPasswordToken?: boolean
    resetPasswordExpires?: boolean
    lastLoginAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    companyId?: boolean
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    role?: boolean
    isEmailVerified?: boolean
    verificationToken?: boolean
    resetPasswordToken?: boolean
    resetPasswordExpires?: boolean
    lastLoginAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    companyId?: boolean
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    role?: boolean
    isEmailVerified?: boolean
    verificationToken?: boolean
    resetPasswordToken?: boolean
    resetPasswordExpires?: boolean
    lastLoginAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    companyId?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "name" | "password" | "role" | "isEmailVerified" | "verificationToken" | "resetPasswordToken" | "resetPasswordExpires" | "lastLoginAt" | "createdAt" | "updatedAt" | "companyId", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    company?: boolean | CompanyDefaultArgs<ExtArgs>
    createdRfqs?: boolean | User$createdRfqsArgs<ExtArgs>
    bids?: boolean | User$bidsArgs<ExtArgs>
    invitedToRfqs?: boolean | User$invitedToRfqsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      company: Prisma.$CompanyPayload<ExtArgs>
      createdRfqs: Prisma.$RFQPayload<ExtArgs>[]
      bids: Prisma.$BidPayload<ExtArgs>[]
      invitedToRfqs: Prisma.$RFQPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      name: string
      password: string
      role: $Enums.Role
      isEmailVerified: boolean
      verificationToken: string | null
      resetPasswordToken: string | null
      resetPasswordExpires: Date | null
      lastLoginAt: Date | null
      createdAt: Date
      updatedAt: Date
      companyId: string
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    company<T extends CompanyDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CompanyDefaultArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    createdRfqs<T extends User$createdRfqsArgs<ExtArgs> = {}>(args?: Subset<T, User$createdRfqsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RFQPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    bids<T extends User$bidsArgs<ExtArgs> = {}>(args?: Subset<T, User$bidsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BidPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    invitedToRfqs<T extends User$invitedToRfqsArgs<ExtArgs> = {}>(args?: Subset<T, User$invitedToRfqsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RFQPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'Role'>
    readonly isEmailVerified: FieldRef<"User", 'Boolean'>
    readonly verificationToken: FieldRef<"User", 'String'>
    readonly resetPasswordToken: FieldRef<"User", 'String'>
    readonly resetPasswordExpires: FieldRef<"User", 'DateTime'>
    readonly lastLoginAt: FieldRef<"User", 'DateTime'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
    readonly companyId: FieldRef<"User", 'String'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.createdRfqs
   */
  export type User$createdRfqsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RFQ
     */
    select?: RFQSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RFQ
     */
    omit?: RFQOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RFQInclude<ExtArgs> | null
    where?: RFQWhereInput
    orderBy?: RFQOrderByWithRelationInput | RFQOrderByWithRelationInput[]
    cursor?: RFQWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RFQScalarFieldEnum | RFQScalarFieldEnum[]
  }

  /**
   * User.bids
   */
  export type User$bidsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bid
     */
    select?: BidSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bid
     */
    omit?: BidOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BidInclude<ExtArgs> | null
    where?: BidWhereInput
    orderBy?: BidOrderByWithRelationInput | BidOrderByWithRelationInput[]
    cursor?: BidWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BidScalarFieldEnum | BidScalarFieldEnum[]
  }

  /**
   * User.invitedToRfqs
   */
  export type User$invitedToRfqsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RFQ
     */
    select?: RFQSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RFQ
     */
    omit?: RFQOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RFQInclude<ExtArgs> | null
    where?: RFQWhereInput
    orderBy?: RFQOrderByWithRelationInput | RFQOrderByWithRelationInput[]
    cursor?: RFQWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RFQScalarFieldEnum | RFQScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Company
   */

  export type AggregateCompany = {
    _count: CompanyCountAggregateOutputType | null
    _avg: CompanyAvgAggregateOutputType | null
    _sum: CompanySumAggregateOutputType | null
    _min: CompanyMinAggregateOutputType | null
    _max: CompanyMaxAggregateOutputType | null
  }

  export type CompanyAvgAggregateOutputType = {
    averageRating: number | null
    foundedYear: number | null
    employeeCount: number | null
    annualRevenue: number | null
  }

  export type CompanySumAggregateOutputType = {
    averageRating: number | null
    foundedYear: number | null
    employeeCount: number | null
    annualRevenue: number | null
  }

  export type CompanyMinAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    industry: string | null
    website: string | null
    address: string | null
    phone: string | null
    email: string | null
    logoUrl: string | null
    isVerified: boolean | null
    averageRating: number | null
    registrationNumber: string | null
    taxId: string | null
    foundedYear: number | null
    employeeCount: number | null
    annualRevenue: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CompanyMaxAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    industry: string | null
    website: string | null
    address: string | null
    phone: string | null
    email: string | null
    logoUrl: string | null
    isVerified: boolean | null
    averageRating: number | null
    registrationNumber: string | null
    taxId: string | null
    foundedYear: number | null
    employeeCount: number | null
    annualRevenue: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CompanyCountAggregateOutputType = {
    id: number
    name: number
    description: number
    industry: number
    website: number
    address: number
    phone: number
    email: number
    logoUrl: number
    isVerified: number
    averageRating: number
    registrationNumber: number
    taxId: number
    foundedYear: number
    employeeCount: number
    annualRevenue: number
    certifications: number
    serviceAreas: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CompanyAvgAggregateInputType = {
    averageRating?: true
    foundedYear?: true
    employeeCount?: true
    annualRevenue?: true
  }

  export type CompanySumAggregateInputType = {
    averageRating?: true
    foundedYear?: true
    employeeCount?: true
    annualRevenue?: true
  }

  export type CompanyMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    industry?: true
    website?: true
    address?: true
    phone?: true
    email?: true
    logoUrl?: true
    isVerified?: true
    averageRating?: true
    registrationNumber?: true
    taxId?: true
    foundedYear?: true
    employeeCount?: true
    annualRevenue?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CompanyMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    industry?: true
    website?: true
    address?: true
    phone?: true
    email?: true
    logoUrl?: true
    isVerified?: true
    averageRating?: true
    registrationNumber?: true
    taxId?: true
    foundedYear?: true
    employeeCount?: true
    annualRevenue?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CompanyCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    industry?: true
    website?: true
    address?: true
    phone?: true
    email?: true
    logoUrl?: true
    isVerified?: true
    averageRating?: true
    registrationNumber?: true
    taxId?: true
    foundedYear?: true
    employeeCount?: true
    annualRevenue?: true
    certifications?: true
    serviceAreas?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CompanyAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Company to aggregate.
     */
    where?: CompanyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Companies to fetch.
     */
    orderBy?: CompanyOrderByWithRelationInput | CompanyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CompanyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Companies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Companies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Companies
    **/
    _count?: true | CompanyCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CompanyAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CompanySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CompanyMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CompanyMaxAggregateInputType
  }

  export type GetCompanyAggregateType<T extends CompanyAggregateArgs> = {
        [P in keyof T & keyof AggregateCompany]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCompany[P]>
      : GetScalarType<T[P], AggregateCompany[P]>
  }




  export type CompanyGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CompanyWhereInput
    orderBy?: CompanyOrderByWithAggregationInput | CompanyOrderByWithAggregationInput[]
    by: CompanyScalarFieldEnum[] | CompanyScalarFieldEnum
    having?: CompanyScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CompanyCountAggregateInputType | true
    _avg?: CompanyAvgAggregateInputType
    _sum?: CompanySumAggregateInputType
    _min?: CompanyMinAggregateInputType
    _max?: CompanyMaxAggregateInputType
  }

  export type CompanyGroupByOutputType = {
    id: string
    name: string
    description: string | null
    industry: string | null
    website: string | null
    address: string | null
    phone: string | null
    email: string | null
    logoUrl: string | null
    isVerified: boolean
    averageRating: number | null
    registrationNumber: string | null
    taxId: string | null
    foundedYear: number | null
    employeeCount: number | null
    annualRevenue: number | null
    certifications: JsonValue | null
    serviceAreas: JsonValue | null
    createdAt: Date
    updatedAt: Date
    _count: CompanyCountAggregateOutputType | null
    _avg: CompanyAvgAggregateOutputType | null
    _sum: CompanySumAggregateOutputType | null
    _min: CompanyMinAggregateOutputType | null
    _max: CompanyMaxAggregateOutputType | null
  }

  type GetCompanyGroupByPayload<T extends CompanyGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CompanyGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CompanyGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CompanyGroupByOutputType[P]>
            : GetScalarType<T[P], CompanyGroupByOutputType[P]>
        }
      >
    >


  export type CompanySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    industry?: boolean
    website?: boolean
    address?: boolean
    phone?: boolean
    email?: boolean
    logoUrl?: boolean
    isVerified?: boolean
    averageRating?: boolean
    registrationNumber?: boolean
    taxId?: boolean
    foundedYear?: boolean
    employeeCount?: boolean
    annualRevenue?: boolean
    certifications?: boolean
    serviceAreas?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    users?: boolean | Company$usersArgs<ExtArgs>
    products?: boolean | Company$productsArgs<ExtArgs>
    _count?: boolean | CompanyCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["company"]>

  export type CompanySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    industry?: boolean
    website?: boolean
    address?: boolean
    phone?: boolean
    email?: boolean
    logoUrl?: boolean
    isVerified?: boolean
    averageRating?: boolean
    registrationNumber?: boolean
    taxId?: boolean
    foundedYear?: boolean
    employeeCount?: boolean
    annualRevenue?: boolean
    certifications?: boolean
    serviceAreas?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["company"]>

  export type CompanySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    industry?: boolean
    website?: boolean
    address?: boolean
    phone?: boolean
    email?: boolean
    logoUrl?: boolean
    isVerified?: boolean
    averageRating?: boolean
    registrationNumber?: boolean
    taxId?: boolean
    foundedYear?: boolean
    employeeCount?: boolean
    annualRevenue?: boolean
    certifications?: boolean
    serviceAreas?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["company"]>

  export type CompanySelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    industry?: boolean
    website?: boolean
    address?: boolean
    phone?: boolean
    email?: boolean
    logoUrl?: boolean
    isVerified?: boolean
    averageRating?: boolean
    registrationNumber?: boolean
    taxId?: boolean
    foundedYear?: boolean
    employeeCount?: boolean
    annualRevenue?: boolean
    certifications?: boolean
    serviceAreas?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CompanyOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description" | "industry" | "website" | "address" | "phone" | "email" | "logoUrl" | "isVerified" | "averageRating" | "registrationNumber" | "taxId" | "foundedYear" | "employeeCount" | "annualRevenue" | "certifications" | "serviceAreas" | "createdAt" | "updatedAt", ExtArgs["result"]["company"]>
  export type CompanyInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | Company$usersArgs<ExtArgs>
    products?: boolean | Company$productsArgs<ExtArgs>
    _count?: boolean | CompanyCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CompanyIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type CompanyIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CompanyPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Company"
    objects: {
      users: Prisma.$UserPayload<ExtArgs>[]
      products: Prisma.$ProductPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      description: string | null
      industry: string | null
      website: string | null
      address: string | null
      phone: string | null
      email: string | null
      logoUrl: string | null
      isVerified: boolean
      averageRating: number | null
      registrationNumber: string | null
      taxId: string | null
      foundedYear: number | null
      employeeCount: number | null
      annualRevenue: number | null
      certifications: Prisma.JsonValue | null
      serviceAreas: Prisma.JsonValue | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["company"]>
    composites: {}
  }

  type CompanyGetPayload<S extends boolean | null | undefined | CompanyDefaultArgs> = $Result.GetResult<Prisma.$CompanyPayload, S>

  type CompanyCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CompanyFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CompanyCountAggregateInputType | true
    }

  export interface CompanyDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Company'], meta: { name: 'Company' } }
    /**
     * Find zero or one Company that matches the filter.
     * @param {CompanyFindUniqueArgs} args - Arguments to find a Company
     * @example
     * // Get one Company
     * const company = await prisma.company.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CompanyFindUniqueArgs>(args: SelectSubset<T, CompanyFindUniqueArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Company that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CompanyFindUniqueOrThrowArgs} args - Arguments to find a Company
     * @example
     * // Get one Company
     * const company = await prisma.company.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CompanyFindUniqueOrThrowArgs>(args: SelectSubset<T, CompanyFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Company that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompanyFindFirstArgs} args - Arguments to find a Company
     * @example
     * // Get one Company
     * const company = await prisma.company.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CompanyFindFirstArgs>(args?: SelectSubset<T, CompanyFindFirstArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Company that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompanyFindFirstOrThrowArgs} args - Arguments to find a Company
     * @example
     * // Get one Company
     * const company = await prisma.company.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CompanyFindFirstOrThrowArgs>(args?: SelectSubset<T, CompanyFindFirstOrThrowArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Companies that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompanyFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Companies
     * const companies = await prisma.company.findMany()
     * 
     * // Get first 10 Companies
     * const companies = await prisma.company.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const companyWithIdOnly = await prisma.company.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CompanyFindManyArgs>(args?: SelectSubset<T, CompanyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Company.
     * @param {CompanyCreateArgs} args - Arguments to create a Company.
     * @example
     * // Create one Company
     * const Company = await prisma.company.create({
     *   data: {
     *     // ... data to create a Company
     *   }
     * })
     * 
     */
    create<T extends CompanyCreateArgs>(args: SelectSubset<T, CompanyCreateArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Companies.
     * @param {CompanyCreateManyArgs} args - Arguments to create many Companies.
     * @example
     * // Create many Companies
     * const company = await prisma.company.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CompanyCreateManyArgs>(args?: SelectSubset<T, CompanyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Companies and returns the data saved in the database.
     * @param {CompanyCreateManyAndReturnArgs} args - Arguments to create many Companies.
     * @example
     * // Create many Companies
     * const company = await prisma.company.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Companies and only return the `id`
     * const companyWithIdOnly = await prisma.company.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CompanyCreateManyAndReturnArgs>(args?: SelectSubset<T, CompanyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Company.
     * @param {CompanyDeleteArgs} args - Arguments to delete one Company.
     * @example
     * // Delete one Company
     * const Company = await prisma.company.delete({
     *   where: {
     *     // ... filter to delete one Company
     *   }
     * })
     * 
     */
    delete<T extends CompanyDeleteArgs>(args: SelectSubset<T, CompanyDeleteArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Company.
     * @param {CompanyUpdateArgs} args - Arguments to update one Company.
     * @example
     * // Update one Company
     * const company = await prisma.company.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CompanyUpdateArgs>(args: SelectSubset<T, CompanyUpdateArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Companies.
     * @param {CompanyDeleteManyArgs} args - Arguments to filter Companies to delete.
     * @example
     * // Delete a few Companies
     * const { count } = await prisma.company.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CompanyDeleteManyArgs>(args?: SelectSubset<T, CompanyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Companies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompanyUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Companies
     * const company = await prisma.company.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CompanyUpdateManyArgs>(args: SelectSubset<T, CompanyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Companies and returns the data updated in the database.
     * @param {CompanyUpdateManyAndReturnArgs} args - Arguments to update many Companies.
     * @example
     * // Update many Companies
     * const company = await prisma.company.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Companies and only return the `id`
     * const companyWithIdOnly = await prisma.company.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CompanyUpdateManyAndReturnArgs>(args: SelectSubset<T, CompanyUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Company.
     * @param {CompanyUpsertArgs} args - Arguments to update or create a Company.
     * @example
     * // Update or create a Company
     * const company = await prisma.company.upsert({
     *   create: {
     *     // ... data to create a Company
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Company we want to update
     *   }
     * })
     */
    upsert<T extends CompanyUpsertArgs>(args: SelectSubset<T, CompanyUpsertArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Companies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompanyCountArgs} args - Arguments to filter Companies to count.
     * @example
     * // Count the number of Companies
     * const count = await prisma.company.count({
     *   where: {
     *     // ... the filter for the Companies we want to count
     *   }
     * })
    **/
    count<T extends CompanyCountArgs>(
      args?: Subset<T, CompanyCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CompanyCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Company.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompanyAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CompanyAggregateArgs>(args: Subset<T, CompanyAggregateArgs>): Prisma.PrismaPromise<GetCompanyAggregateType<T>>

    /**
     * Group by Company.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompanyGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CompanyGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CompanyGroupByArgs['orderBy'] }
        : { orderBy?: CompanyGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CompanyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCompanyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Company model
   */
  readonly fields: CompanyFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Company.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CompanyClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    users<T extends Company$usersArgs<ExtArgs> = {}>(args?: Subset<T, Company$usersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    products<T extends Company$productsArgs<ExtArgs> = {}>(args?: Subset<T, Company$productsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Company model
   */
  interface CompanyFieldRefs {
    readonly id: FieldRef<"Company", 'String'>
    readonly name: FieldRef<"Company", 'String'>
    readonly description: FieldRef<"Company", 'String'>
    readonly industry: FieldRef<"Company", 'String'>
    readonly website: FieldRef<"Company", 'String'>
    readonly address: FieldRef<"Company", 'String'>
    readonly phone: FieldRef<"Company", 'String'>
    readonly email: FieldRef<"Company", 'String'>
    readonly logoUrl: FieldRef<"Company", 'String'>
    readonly isVerified: FieldRef<"Company", 'Boolean'>
    readonly averageRating: FieldRef<"Company", 'Float'>
    readonly registrationNumber: FieldRef<"Company", 'String'>
    readonly taxId: FieldRef<"Company", 'String'>
    readonly foundedYear: FieldRef<"Company", 'Int'>
    readonly employeeCount: FieldRef<"Company", 'Int'>
    readonly annualRevenue: FieldRef<"Company", 'Float'>
    readonly certifications: FieldRef<"Company", 'Json'>
    readonly serviceAreas: FieldRef<"Company", 'Json'>
    readonly createdAt: FieldRef<"Company", 'DateTime'>
    readonly updatedAt: FieldRef<"Company", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Company findUnique
   */
  export type CompanyFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * Filter, which Company to fetch.
     */
    where: CompanyWhereUniqueInput
  }

  /**
   * Company findUniqueOrThrow
   */
  export type CompanyFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * Filter, which Company to fetch.
     */
    where: CompanyWhereUniqueInput
  }

  /**
   * Company findFirst
   */
  export type CompanyFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * Filter, which Company to fetch.
     */
    where?: CompanyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Companies to fetch.
     */
    orderBy?: CompanyOrderByWithRelationInput | CompanyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Companies.
     */
    cursor?: CompanyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Companies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Companies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Companies.
     */
    distinct?: CompanyScalarFieldEnum | CompanyScalarFieldEnum[]
  }

  /**
   * Company findFirstOrThrow
   */
  export type CompanyFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * Filter, which Company to fetch.
     */
    where?: CompanyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Companies to fetch.
     */
    orderBy?: CompanyOrderByWithRelationInput | CompanyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Companies.
     */
    cursor?: CompanyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Companies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Companies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Companies.
     */
    distinct?: CompanyScalarFieldEnum | CompanyScalarFieldEnum[]
  }

  /**
   * Company findMany
   */
  export type CompanyFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * Filter, which Companies to fetch.
     */
    where?: CompanyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Companies to fetch.
     */
    orderBy?: CompanyOrderByWithRelationInput | CompanyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Companies.
     */
    cursor?: CompanyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Companies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Companies.
     */
    skip?: number
    distinct?: CompanyScalarFieldEnum | CompanyScalarFieldEnum[]
  }

  /**
   * Company create
   */
  export type CompanyCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * The data needed to create a Company.
     */
    data: XOR<CompanyCreateInput, CompanyUncheckedCreateInput>
  }

  /**
   * Company createMany
   */
  export type CompanyCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Companies.
     */
    data: CompanyCreateManyInput | CompanyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Company createManyAndReturn
   */
  export type CompanyCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * The data used to create many Companies.
     */
    data: CompanyCreateManyInput | CompanyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Company update
   */
  export type CompanyUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * The data needed to update a Company.
     */
    data: XOR<CompanyUpdateInput, CompanyUncheckedUpdateInput>
    /**
     * Choose, which Company to update.
     */
    where: CompanyWhereUniqueInput
  }

  /**
   * Company updateMany
   */
  export type CompanyUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Companies.
     */
    data: XOR<CompanyUpdateManyMutationInput, CompanyUncheckedUpdateManyInput>
    /**
     * Filter which Companies to update
     */
    where?: CompanyWhereInput
    /**
     * Limit how many Companies to update.
     */
    limit?: number
  }

  /**
   * Company updateManyAndReturn
   */
  export type CompanyUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * The data used to update Companies.
     */
    data: XOR<CompanyUpdateManyMutationInput, CompanyUncheckedUpdateManyInput>
    /**
     * Filter which Companies to update
     */
    where?: CompanyWhereInput
    /**
     * Limit how many Companies to update.
     */
    limit?: number
  }

  /**
   * Company upsert
   */
  export type CompanyUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * The filter to search for the Company to update in case it exists.
     */
    where: CompanyWhereUniqueInput
    /**
     * In case the Company found by the `where` argument doesn't exist, create a new Company with this data.
     */
    create: XOR<CompanyCreateInput, CompanyUncheckedCreateInput>
    /**
     * In case the Company was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CompanyUpdateInput, CompanyUncheckedUpdateInput>
  }

  /**
   * Company delete
   */
  export type CompanyDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * Filter which Company to delete.
     */
    where: CompanyWhereUniqueInput
  }

  /**
   * Company deleteMany
   */
  export type CompanyDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Companies to delete
     */
    where?: CompanyWhereInput
    /**
     * Limit how many Companies to delete.
     */
    limit?: number
  }

  /**
   * Company.users
   */
  export type Company$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * Company.products
   */
  export type Company$productsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    where?: ProductWhereInput
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    cursor?: ProductWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Company without action
   */
  export type CompanyDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
  }


  /**
   * Model Product
   */

  export type AggregateProduct = {
    _count: ProductCountAggregateOutputType | null
    _avg: ProductAvgAggregateOutputType | null
    _sum: ProductSumAggregateOutputType | null
    _min: ProductMinAggregateOutputType | null
    _max: ProductMaxAggregateOutputType | null
  }

  export type ProductAvgAggregateOutputType = {
    price: number | null
    minimumOrderQuantity: number | null
  }

  export type ProductSumAggregateOutputType = {
    price: number | null
    minimumOrderQuantity: number | null
  }

  export type ProductMinAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    category: string | null
    price: number | null
    unit: string | null
    minimumOrderQuantity: number | null
    supplyAbility: string | null
    companyId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProductMaxAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    category: string | null
    price: number | null
    unit: string | null
    minimumOrderQuantity: number | null
    supplyAbility: string | null
    companyId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProductCountAggregateOutputType = {
    id: number
    name: number
    description: number
    category: number
    price: number
    unit: number
    minimumOrderQuantity: number
    supplyAbility: number
    specifications: number
    images: number
    videos: number
    keywords: number
    companyId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ProductAvgAggregateInputType = {
    price?: true
    minimumOrderQuantity?: true
  }

  export type ProductSumAggregateInputType = {
    price?: true
    minimumOrderQuantity?: true
  }

  export type ProductMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    category?: true
    price?: true
    unit?: true
    minimumOrderQuantity?: true
    supplyAbility?: true
    companyId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProductMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    category?: true
    price?: true
    unit?: true
    minimumOrderQuantity?: true
    supplyAbility?: true
    companyId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProductCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    category?: true
    price?: true
    unit?: true
    minimumOrderQuantity?: true
    supplyAbility?: true
    specifications?: true
    images?: true
    videos?: true
    keywords?: true
    companyId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ProductAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Product to aggregate.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Products
    **/
    _count?: true | ProductCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProductAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProductSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProductMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProductMaxAggregateInputType
  }

  export type GetProductAggregateType<T extends ProductAggregateArgs> = {
        [P in keyof T & keyof AggregateProduct]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProduct[P]>
      : GetScalarType<T[P], AggregateProduct[P]>
  }




  export type ProductGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductWhereInput
    orderBy?: ProductOrderByWithAggregationInput | ProductOrderByWithAggregationInput[]
    by: ProductScalarFieldEnum[] | ProductScalarFieldEnum
    having?: ProductScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProductCountAggregateInputType | true
    _avg?: ProductAvgAggregateInputType
    _sum?: ProductSumAggregateInputType
    _min?: ProductMinAggregateInputType
    _max?: ProductMaxAggregateInputType
  }

  export type ProductGroupByOutputType = {
    id: string
    name: string
    description: string | null
    category: string | null
    price: number | null
    unit: string | null
    minimumOrderQuantity: number | null
    supplyAbility: string | null
    specifications: JsonValue | null
    images: JsonValue | null
    videos: JsonValue | null
    keywords: JsonValue | null
    companyId: string
    createdAt: Date
    updatedAt: Date
    _count: ProductCountAggregateOutputType | null
    _avg: ProductAvgAggregateOutputType | null
    _sum: ProductSumAggregateOutputType | null
    _min: ProductMinAggregateOutputType | null
    _max: ProductMaxAggregateOutputType | null
  }

  type GetProductGroupByPayload<T extends ProductGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProductGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProductGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProductGroupByOutputType[P]>
            : GetScalarType<T[P], ProductGroupByOutputType[P]>
        }
      >
    >


  export type ProductSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    category?: boolean
    price?: boolean
    unit?: boolean
    minimumOrderQuantity?: boolean
    supplyAbility?: boolean
    specifications?: boolean
    images?: boolean
    videos?: boolean
    keywords?: boolean
    companyId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["product"]>

  export type ProductSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    category?: boolean
    price?: boolean
    unit?: boolean
    minimumOrderQuantity?: boolean
    supplyAbility?: boolean
    specifications?: boolean
    images?: boolean
    videos?: boolean
    keywords?: boolean
    companyId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["product"]>

  export type ProductSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    category?: boolean
    price?: boolean
    unit?: boolean
    minimumOrderQuantity?: boolean
    supplyAbility?: boolean
    specifications?: boolean
    images?: boolean
    videos?: boolean
    keywords?: boolean
    companyId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["product"]>

  export type ProductSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    category?: boolean
    price?: boolean
    unit?: boolean
    minimumOrderQuantity?: boolean
    supplyAbility?: boolean
    specifications?: boolean
    images?: boolean
    videos?: boolean
    keywords?: boolean
    companyId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ProductOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description" | "category" | "price" | "unit" | "minimumOrderQuantity" | "supplyAbility" | "specifications" | "images" | "videos" | "keywords" | "companyId" | "createdAt" | "updatedAt", ExtArgs["result"]["product"]>
  export type ProductInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }
  export type ProductIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }
  export type ProductIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }

  export type $ProductPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Product"
    objects: {
      company: Prisma.$CompanyPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      description: string | null
      category: string | null
      price: number | null
      unit: string | null
      minimumOrderQuantity: number | null
      supplyAbility: string | null
      specifications: Prisma.JsonValue | null
      images: Prisma.JsonValue | null
      videos: Prisma.JsonValue | null
      keywords: Prisma.JsonValue | null
      companyId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["product"]>
    composites: {}
  }

  type ProductGetPayload<S extends boolean | null | undefined | ProductDefaultArgs> = $Result.GetResult<Prisma.$ProductPayload, S>

  type ProductCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ProductFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProductCountAggregateInputType | true
    }

  export interface ProductDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Product'], meta: { name: 'Product' } }
    /**
     * Find zero or one Product that matches the filter.
     * @param {ProductFindUniqueArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProductFindUniqueArgs>(args: SelectSubset<T, ProductFindUniqueArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Product that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProductFindUniqueOrThrowArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProductFindUniqueOrThrowArgs>(args: SelectSubset<T, ProductFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Product that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindFirstArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProductFindFirstArgs>(args?: SelectSubset<T, ProductFindFirstArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Product that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindFirstOrThrowArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProductFindFirstOrThrowArgs>(args?: SelectSubset<T, ProductFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Products that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Products
     * const products = await prisma.product.findMany()
     * 
     * // Get first 10 Products
     * const products = await prisma.product.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const productWithIdOnly = await prisma.product.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProductFindManyArgs>(args?: SelectSubset<T, ProductFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Product.
     * @param {ProductCreateArgs} args - Arguments to create a Product.
     * @example
     * // Create one Product
     * const Product = await prisma.product.create({
     *   data: {
     *     // ... data to create a Product
     *   }
     * })
     * 
     */
    create<T extends ProductCreateArgs>(args: SelectSubset<T, ProductCreateArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Products.
     * @param {ProductCreateManyArgs} args - Arguments to create many Products.
     * @example
     * // Create many Products
     * const product = await prisma.product.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProductCreateManyArgs>(args?: SelectSubset<T, ProductCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Products and returns the data saved in the database.
     * @param {ProductCreateManyAndReturnArgs} args - Arguments to create many Products.
     * @example
     * // Create many Products
     * const product = await prisma.product.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Products and only return the `id`
     * const productWithIdOnly = await prisma.product.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProductCreateManyAndReturnArgs>(args?: SelectSubset<T, ProductCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Product.
     * @param {ProductDeleteArgs} args - Arguments to delete one Product.
     * @example
     * // Delete one Product
     * const Product = await prisma.product.delete({
     *   where: {
     *     // ... filter to delete one Product
     *   }
     * })
     * 
     */
    delete<T extends ProductDeleteArgs>(args: SelectSubset<T, ProductDeleteArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Product.
     * @param {ProductUpdateArgs} args - Arguments to update one Product.
     * @example
     * // Update one Product
     * const product = await prisma.product.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProductUpdateArgs>(args: SelectSubset<T, ProductUpdateArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Products.
     * @param {ProductDeleteManyArgs} args - Arguments to filter Products to delete.
     * @example
     * // Delete a few Products
     * const { count } = await prisma.product.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProductDeleteManyArgs>(args?: SelectSubset<T, ProductDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Products
     * const product = await prisma.product.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProductUpdateManyArgs>(args: SelectSubset<T, ProductUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Products and returns the data updated in the database.
     * @param {ProductUpdateManyAndReturnArgs} args - Arguments to update many Products.
     * @example
     * // Update many Products
     * const product = await prisma.product.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Products and only return the `id`
     * const productWithIdOnly = await prisma.product.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ProductUpdateManyAndReturnArgs>(args: SelectSubset<T, ProductUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Product.
     * @param {ProductUpsertArgs} args - Arguments to update or create a Product.
     * @example
     * // Update or create a Product
     * const product = await prisma.product.upsert({
     *   create: {
     *     // ... data to create a Product
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Product we want to update
     *   }
     * })
     */
    upsert<T extends ProductUpsertArgs>(args: SelectSubset<T, ProductUpsertArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductCountArgs} args - Arguments to filter Products to count.
     * @example
     * // Count the number of Products
     * const count = await prisma.product.count({
     *   where: {
     *     // ... the filter for the Products we want to count
     *   }
     * })
    **/
    count<T extends ProductCountArgs>(
      args?: Subset<T, ProductCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProductCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Product.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProductAggregateArgs>(args: Subset<T, ProductAggregateArgs>): Prisma.PrismaPromise<GetProductAggregateType<T>>

    /**
     * Group by Product.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProductGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProductGroupByArgs['orderBy'] }
        : { orderBy?: ProductGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProductGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProductGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Product model
   */
  readonly fields: ProductFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Product.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProductClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    company<T extends CompanyDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CompanyDefaultArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Product model
   */
  interface ProductFieldRefs {
    readonly id: FieldRef<"Product", 'String'>
    readonly name: FieldRef<"Product", 'String'>
    readonly description: FieldRef<"Product", 'String'>
    readonly category: FieldRef<"Product", 'String'>
    readonly price: FieldRef<"Product", 'Float'>
    readonly unit: FieldRef<"Product", 'String'>
    readonly minimumOrderQuantity: FieldRef<"Product", 'Int'>
    readonly supplyAbility: FieldRef<"Product", 'String'>
    readonly specifications: FieldRef<"Product", 'Json'>
    readonly images: FieldRef<"Product", 'Json'>
    readonly videos: FieldRef<"Product", 'Json'>
    readonly keywords: FieldRef<"Product", 'Json'>
    readonly companyId: FieldRef<"Product", 'String'>
    readonly createdAt: FieldRef<"Product", 'DateTime'>
    readonly updatedAt: FieldRef<"Product", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Product findUnique
   */
  export type ProductFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product findUniqueOrThrow
   */
  export type ProductFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product findFirst
   */
  export type ProductFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Products.
     */
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product findFirstOrThrow
   */
  export type ProductFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Products.
     */
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product findMany
   */
  export type ProductFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Products to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product create
   */
  export type ProductCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The data needed to create a Product.
     */
    data: XOR<ProductCreateInput, ProductUncheckedCreateInput>
  }

  /**
   * Product createMany
   */
  export type ProductCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Products.
     */
    data: ProductCreateManyInput | ProductCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Product createManyAndReturn
   */
  export type ProductCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * The data used to create many Products.
     */
    data: ProductCreateManyInput | ProductCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Product update
   */
  export type ProductUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The data needed to update a Product.
     */
    data: XOR<ProductUpdateInput, ProductUncheckedUpdateInput>
    /**
     * Choose, which Product to update.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product updateMany
   */
  export type ProductUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Products.
     */
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyInput>
    /**
     * Filter which Products to update
     */
    where?: ProductWhereInput
    /**
     * Limit how many Products to update.
     */
    limit?: number
  }

  /**
   * Product updateManyAndReturn
   */
  export type ProductUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * The data used to update Products.
     */
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyInput>
    /**
     * Filter which Products to update
     */
    where?: ProductWhereInput
    /**
     * Limit how many Products to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Product upsert
   */
  export type ProductUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The filter to search for the Product to update in case it exists.
     */
    where: ProductWhereUniqueInput
    /**
     * In case the Product found by the `where` argument doesn't exist, create a new Product with this data.
     */
    create: XOR<ProductCreateInput, ProductUncheckedCreateInput>
    /**
     * In case the Product was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProductUpdateInput, ProductUncheckedUpdateInput>
  }

  /**
   * Product delete
   */
  export type ProductDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter which Product to delete.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product deleteMany
   */
  export type ProductDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Products to delete
     */
    where?: ProductWhereInput
    /**
     * Limit how many Products to delete.
     */
    limit?: number
  }

  /**
   * Product without action
   */
  export type ProductDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
  }


  /**
   * Model RFQ
   */

  export type AggregateRFQ = {
    _count: RFQCountAggregateOutputType | null
    _avg: RFQAvgAggregateOutputType | null
    _sum: RFQSumAggregateOutputType | null
    _min: RFQMinAggregateOutputType | null
    _max: RFQMaxAggregateOutputType | null
  }

  export type RFQAvgAggregateOutputType = {
    quantity: number | null
    minBudget: number | null
    maxBudget: number | null
  }

  export type RFQSumAggregateOutputType = {
    quantity: number | null
    minBudget: number | null
    maxBudget: number | null
  }

  export type RFQMinAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    category: string | null
    quantity: number | null
    unit: string | null
    deadline: Date | null
    status: $Enums.RFQStatus | null
    minBudget: number | null
    maxBudget: number | null
    preferredDeliveryDate: Date | null
    deliveryLocation: string | null
    requirementsDocument: string | null
    visibility: $Enums.Visibility | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
  }

  export type RFQMaxAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    category: string | null
    quantity: number | null
    unit: string | null
    deadline: Date | null
    status: $Enums.RFQStatus | null
    minBudget: number | null
    maxBudget: number | null
    preferredDeliveryDate: Date | null
    deliveryLocation: string | null
    requirementsDocument: string | null
    visibility: $Enums.Visibility | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
  }

  export type RFQCountAggregateOutputType = {
    id: number
    title: number
    description: number
    category: number
    quantity: number
    unit: number
    deadline: number
    status: number
    attachments: number
    minBudget: number
    maxBudget: number
    preferredDeliveryDate: number
    deliveryLocation: number
    requirementsDocument: number
    qualificationCriteria: number
    tags: number
    visibility: number
    createdAt: number
    updatedAt: number
    userId: number
    _all: number
  }


  export type RFQAvgAggregateInputType = {
    quantity?: true
    minBudget?: true
    maxBudget?: true
  }

  export type RFQSumAggregateInputType = {
    quantity?: true
    minBudget?: true
    maxBudget?: true
  }

  export type RFQMinAggregateInputType = {
    id?: true
    title?: true
    description?: true
    category?: true
    quantity?: true
    unit?: true
    deadline?: true
    status?: true
    minBudget?: true
    maxBudget?: true
    preferredDeliveryDate?: true
    deliveryLocation?: true
    requirementsDocument?: true
    visibility?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
  }

  export type RFQMaxAggregateInputType = {
    id?: true
    title?: true
    description?: true
    category?: true
    quantity?: true
    unit?: true
    deadline?: true
    status?: true
    minBudget?: true
    maxBudget?: true
    preferredDeliveryDate?: true
    deliveryLocation?: true
    requirementsDocument?: true
    visibility?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
  }

  export type RFQCountAggregateInputType = {
    id?: true
    title?: true
    description?: true
    category?: true
    quantity?: true
    unit?: true
    deadline?: true
    status?: true
    attachments?: true
    minBudget?: true
    maxBudget?: true
    preferredDeliveryDate?: true
    deliveryLocation?: true
    requirementsDocument?: true
    qualificationCriteria?: true
    tags?: true
    visibility?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    _all?: true
  }

  export type RFQAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RFQ to aggregate.
     */
    where?: RFQWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RFQS to fetch.
     */
    orderBy?: RFQOrderByWithRelationInput | RFQOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RFQWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RFQS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RFQS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RFQS
    **/
    _count?: true | RFQCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RFQAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RFQSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RFQMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RFQMaxAggregateInputType
  }

  export type GetRFQAggregateType<T extends RFQAggregateArgs> = {
        [P in keyof T & keyof AggregateRFQ]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRFQ[P]>
      : GetScalarType<T[P], AggregateRFQ[P]>
  }




  export type RFQGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RFQWhereInput
    orderBy?: RFQOrderByWithAggregationInput | RFQOrderByWithAggregationInput[]
    by: RFQScalarFieldEnum[] | RFQScalarFieldEnum
    having?: RFQScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RFQCountAggregateInputType | true
    _avg?: RFQAvgAggregateInputType
    _sum?: RFQSumAggregateInputType
    _min?: RFQMinAggregateInputType
    _max?: RFQMaxAggregateInputType
  }

  export type RFQGroupByOutputType = {
    id: string
    title: string
    description: string
    category: string
    quantity: number
    unit: string
    deadline: Date
    status: $Enums.RFQStatus
    attachments: JsonValue | null
    minBudget: number | null
    maxBudget: number | null
    preferredDeliveryDate: Date | null
    deliveryLocation: string | null
    requirementsDocument: string | null
    qualificationCriteria: string[]
    tags: string[]
    visibility: $Enums.Visibility
    createdAt: Date
    updatedAt: Date
    userId: string
    _count: RFQCountAggregateOutputType | null
    _avg: RFQAvgAggregateOutputType | null
    _sum: RFQSumAggregateOutputType | null
    _min: RFQMinAggregateOutputType | null
    _max: RFQMaxAggregateOutputType | null
  }

  type GetRFQGroupByPayload<T extends RFQGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RFQGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RFQGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RFQGroupByOutputType[P]>
            : GetScalarType<T[P], RFQGroupByOutputType[P]>
        }
      >
    >


  export type RFQSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    category?: boolean
    quantity?: boolean
    unit?: boolean
    deadline?: boolean
    status?: boolean
    attachments?: boolean
    minBudget?: boolean
    maxBudget?: boolean
    preferredDeliveryDate?: boolean
    deliveryLocation?: boolean
    requirementsDocument?: boolean
    qualificationCriteria?: boolean
    tags?: boolean
    visibility?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
    invitedSuppliers?: boolean | RFQ$invitedSuppliersArgs<ExtArgs>
    bids?: boolean | RFQ$bidsArgs<ExtArgs>
    _count?: boolean | RFQCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["rFQ"]>

  export type RFQSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    category?: boolean
    quantity?: boolean
    unit?: boolean
    deadline?: boolean
    status?: boolean
    attachments?: boolean
    minBudget?: boolean
    maxBudget?: boolean
    preferredDeliveryDate?: boolean
    deliveryLocation?: boolean
    requirementsDocument?: boolean
    qualificationCriteria?: boolean
    tags?: boolean
    visibility?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["rFQ"]>

  export type RFQSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    category?: boolean
    quantity?: boolean
    unit?: boolean
    deadline?: boolean
    status?: boolean
    attachments?: boolean
    minBudget?: boolean
    maxBudget?: boolean
    preferredDeliveryDate?: boolean
    deliveryLocation?: boolean
    requirementsDocument?: boolean
    qualificationCriteria?: boolean
    tags?: boolean
    visibility?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["rFQ"]>

  export type RFQSelectScalar = {
    id?: boolean
    title?: boolean
    description?: boolean
    category?: boolean
    quantity?: boolean
    unit?: boolean
    deadline?: boolean
    status?: boolean
    attachments?: boolean
    minBudget?: boolean
    maxBudget?: boolean
    preferredDeliveryDate?: boolean
    deliveryLocation?: boolean
    requirementsDocument?: boolean
    qualificationCriteria?: boolean
    tags?: boolean
    visibility?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
  }

  export type RFQOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "description" | "category" | "quantity" | "unit" | "deadline" | "status" | "attachments" | "minBudget" | "maxBudget" | "preferredDeliveryDate" | "deliveryLocation" | "requirementsDocument" | "qualificationCriteria" | "tags" | "visibility" | "createdAt" | "updatedAt" | "userId", ExtArgs["result"]["rFQ"]>
  export type RFQInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
    invitedSuppliers?: boolean | RFQ$invitedSuppliersArgs<ExtArgs>
    bids?: boolean | RFQ$bidsArgs<ExtArgs>
    _count?: boolean | RFQCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type RFQIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type RFQIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $RFQPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RFQ"
    objects: {
      createdBy: Prisma.$UserPayload<ExtArgs>
      invitedSuppliers: Prisma.$UserPayload<ExtArgs>[]
      bids: Prisma.$BidPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      description: string
      category: string
      quantity: number
      unit: string
      deadline: Date
      status: $Enums.RFQStatus
      attachments: Prisma.JsonValue | null
      minBudget: number | null
      maxBudget: number | null
      preferredDeliveryDate: Date | null
      deliveryLocation: string | null
      requirementsDocument: string | null
      qualificationCriteria: string[]
      tags: string[]
      visibility: $Enums.Visibility
      createdAt: Date
      updatedAt: Date
      userId: string
    }, ExtArgs["result"]["rFQ"]>
    composites: {}
  }

  type RFQGetPayload<S extends boolean | null | undefined | RFQDefaultArgs> = $Result.GetResult<Prisma.$RFQPayload, S>

  type RFQCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RFQFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RFQCountAggregateInputType | true
    }

  export interface RFQDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RFQ'], meta: { name: 'RFQ' } }
    /**
     * Find zero or one RFQ that matches the filter.
     * @param {RFQFindUniqueArgs} args - Arguments to find a RFQ
     * @example
     * // Get one RFQ
     * const rFQ = await prisma.rFQ.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RFQFindUniqueArgs>(args: SelectSubset<T, RFQFindUniqueArgs<ExtArgs>>): Prisma__RFQClient<$Result.GetResult<Prisma.$RFQPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RFQ that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RFQFindUniqueOrThrowArgs} args - Arguments to find a RFQ
     * @example
     * // Get one RFQ
     * const rFQ = await prisma.rFQ.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RFQFindUniqueOrThrowArgs>(args: SelectSubset<T, RFQFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RFQClient<$Result.GetResult<Prisma.$RFQPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RFQ that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RFQFindFirstArgs} args - Arguments to find a RFQ
     * @example
     * // Get one RFQ
     * const rFQ = await prisma.rFQ.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RFQFindFirstArgs>(args?: SelectSubset<T, RFQFindFirstArgs<ExtArgs>>): Prisma__RFQClient<$Result.GetResult<Prisma.$RFQPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RFQ that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RFQFindFirstOrThrowArgs} args - Arguments to find a RFQ
     * @example
     * // Get one RFQ
     * const rFQ = await prisma.rFQ.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RFQFindFirstOrThrowArgs>(args?: SelectSubset<T, RFQFindFirstOrThrowArgs<ExtArgs>>): Prisma__RFQClient<$Result.GetResult<Prisma.$RFQPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RFQS that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RFQFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RFQS
     * const rFQS = await prisma.rFQ.findMany()
     * 
     * // Get first 10 RFQS
     * const rFQS = await prisma.rFQ.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const rFQWithIdOnly = await prisma.rFQ.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RFQFindManyArgs>(args?: SelectSubset<T, RFQFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RFQPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RFQ.
     * @param {RFQCreateArgs} args - Arguments to create a RFQ.
     * @example
     * // Create one RFQ
     * const RFQ = await prisma.rFQ.create({
     *   data: {
     *     // ... data to create a RFQ
     *   }
     * })
     * 
     */
    create<T extends RFQCreateArgs>(args: SelectSubset<T, RFQCreateArgs<ExtArgs>>): Prisma__RFQClient<$Result.GetResult<Prisma.$RFQPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RFQS.
     * @param {RFQCreateManyArgs} args - Arguments to create many RFQS.
     * @example
     * // Create many RFQS
     * const rFQ = await prisma.rFQ.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RFQCreateManyArgs>(args?: SelectSubset<T, RFQCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RFQS and returns the data saved in the database.
     * @param {RFQCreateManyAndReturnArgs} args - Arguments to create many RFQS.
     * @example
     * // Create many RFQS
     * const rFQ = await prisma.rFQ.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RFQS and only return the `id`
     * const rFQWithIdOnly = await prisma.rFQ.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RFQCreateManyAndReturnArgs>(args?: SelectSubset<T, RFQCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RFQPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RFQ.
     * @param {RFQDeleteArgs} args - Arguments to delete one RFQ.
     * @example
     * // Delete one RFQ
     * const RFQ = await prisma.rFQ.delete({
     *   where: {
     *     // ... filter to delete one RFQ
     *   }
     * })
     * 
     */
    delete<T extends RFQDeleteArgs>(args: SelectSubset<T, RFQDeleteArgs<ExtArgs>>): Prisma__RFQClient<$Result.GetResult<Prisma.$RFQPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RFQ.
     * @param {RFQUpdateArgs} args - Arguments to update one RFQ.
     * @example
     * // Update one RFQ
     * const rFQ = await prisma.rFQ.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RFQUpdateArgs>(args: SelectSubset<T, RFQUpdateArgs<ExtArgs>>): Prisma__RFQClient<$Result.GetResult<Prisma.$RFQPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RFQS.
     * @param {RFQDeleteManyArgs} args - Arguments to filter RFQS to delete.
     * @example
     * // Delete a few RFQS
     * const { count } = await prisma.rFQ.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RFQDeleteManyArgs>(args?: SelectSubset<T, RFQDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RFQS.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RFQUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RFQS
     * const rFQ = await prisma.rFQ.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RFQUpdateManyArgs>(args: SelectSubset<T, RFQUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RFQS and returns the data updated in the database.
     * @param {RFQUpdateManyAndReturnArgs} args - Arguments to update many RFQS.
     * @example
     * // Update many RFQS
     * const rFQ = await prisma.rFQ.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RFQS and only return the `id`
     * const rFQWithIdOnly = await prisma.rFQ.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RFQUpdateManyAndReturnArgs>(args: SelectSubset<T, RFQUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RFQPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RFQ.
     * @param {RFQUpsertArgs} args - Arguments to update or create a RFQ.
     * @example
     * // Update or create a RFQ
     * const rFQ = await prisma.rFQ.upsert({
     *   create: {
     *     // ... data to create a RFQ
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RFQ we want to update
     *   }
     * })
     */
    upsert<T extends RFQUpsertArgs>(args: SelectSubset<T, RFQUpsertArgs<ExtArgs>>): Prisma__RFQClient<$Result.GetResult<Prisma.$RFQPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RFQS.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RFQCountArgs} args - Arguments to filter RFQS to count.
     * @example
     * // Count the number of RFQS
     * const count = await prisma.rFQ.count({
     *   where: {
     *     // ... the filter for the RFQS we want to count
     *   }
     * })
    **/
    count<T extends RFQCountArgs>(
      args?: Subset<T, RFQCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RFQCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RFQ.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RFQAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RFQAggregateArgs>(args: Subset<T, RFQAggregateArgs>): Prisma.PrismaPromise<GetRFQAggregateType<T>>

    /**
     * Group by RFQ.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RFQGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RFQGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RFQGroupByArgs['orderBy'] }
        : { orderBy?: RFQGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RFQGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRFQGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RFQ model
   */
  readonly fields: RFQFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RFQ.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RFQClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    createdBy<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    invitedSuppliers<T extends RFQ$invitedSuppliersArgs<ExtArgs> = {}>(args?: Subset<T, RFQ$invitedSuppliersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    bids<T extends RFQ$bidsArgs<ExtArgs> = {}>(args?: Subset<T, RFQ$bidsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BidPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RFQ model
   */
  interface RFQFieldRefs {
    readonly id: FieldRef<"RFQ", 'String'>
    readonly title: FieldRef<"RFQ", 'String'>
    readonly description: FieldRef<"RFQ", 'String'>
    readonly category: FieldRef<"RFQ", 'String'>
    readonly quantity: FieldRef<"RFQ", 'Float'>
    readonly unit: FieldRef<"RFQ", 'String'>
    readonly deadline: FieldRef<"RFQ", 'DateTime'>
    readonly status: FieldRef<"RFQ", 'RFQStatus'>
    readonly attachments: FieldRef<"RFQ", 'Json'>
    readonly minBudget: FieldRef<"RFQ", 'Float'>
    readonly maxBudget: FieldRef<"RFQ", 'Float'>
    readonly preferredDeliveryDate: FieldRef<"RFQ", 'DateTime'>
    readonly deliveryLocation: FieldRef<"RFQ", 'String'>
    readonly requirementsDocument: FieldRef<"RFQ", 'String'>
    readonly qualificationCriteria: FieldRef<"RFQ", 'String[]'>
    readonly tags: FieldRef<"RFQ", 'String[]'>
    readonly visibility: FieldRef<"RFQ", 'Visibility'>
    readonly createdAt: FieldRef<"RFQ", 'DateTime'>
    readonly updatedAt: FieldRef<"RFQ", 'DateTime'>
    readonly userId: FieldRef<"RFQ", 'String'>
  }
    

  // Custom InputTypes
  /**
   * RFQ findUnique
   */
  export type RFQFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RFQ
     */
    select?: RFQSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RFQ
     */
    omit?: RFQOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RFQInclude<ExtArgs> | null
    /**
     * Filter, which RFQ to fetch.
     */
    where: RFQWhereUniqueInput
  }

  /**
   * RFQ findUniqueOrThrow
   */
  export type RFQFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RFQ
     */
    select?: RFQSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RFQ
     */
    omit?: RFQOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RFQInclude<ExtArgs> | null
    /**
     * Filter, which RFQ to fetch.
     */
    where: RFQWhereUniqueInput
  }

  /**
   * RFQ findFirst
   */
  export type RFQFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RFQ
     */
    select?: RFQSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RFQ
     */
    omit?: RFQOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RFQInclude<ExtArgs> | null
    /**
     * Filter, which RFQ to fetch.
     */
    where?: RFQWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RFQS to fetch.
     */
    orderBy?: RFQOrderByWithRelationInput | RFQOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RFQS.
     */
    cursor?: RFQWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RFQS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RFQS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RFQS.
     */
    distinct?: RFQScalarFieldEnum | RFQScalarFieldEnum[]
  }

  /**
   * RFQ findFirstOrThrow
   */
  export type RFQFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RFQ
     */
    select?: RFQSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RFQ
     */
    omit?: RFQOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RFQInclude<ExtArgs> | null
    /**
     * Filter, which RFQ to fetch.
     */
    where?: RFQWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RFQS to fetch.
     */
    orderBy?: RFQOrderByWithRelationInput | RFQOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RFQS.
     */
    cursor?: RFQWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RFQS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RFQS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RFQS.
     */
    distinct?: RFQScalarFieldEnum | RFQScalarFieldEnum[]
  }

  /**
   * RFQ findMany
   */
  export type RFQFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RFQ
     */
    select?: RFQSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RFQ
     */
    omit?: RFQOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RFQInclude<ExtArgs> | null
    /**
     * Filter, which RFQS to fetch.
     */
    where?: RFQWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RFQS to fetch.
     */
    orderBy?: RFQOrderByWithRelationInput | RFQOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RFQS.
     */
    cursor?: RFQWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RFQS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RFQS.
     */
    skip?: number
    distinct?: RFQScalarFieldEnum | RFQScalarFieldEnum[]
  }

  /**
   * RFQ create
   */
  export type RFQCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RFQ
     */
    select?: RFQSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RFQ
     */
    omit?: RFQOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RFQInclude<ExtArgs> | null
    /**
     * The data needed to create a RFQ.
     */
    data: XOR<RFQCreateInput, RFQUncheckedCreateInput>
  }

  /**
   * RFQ createMany
   */
  export type RFQCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RFQS.
     */
    data: RFQCreateManyInput | RFQCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RFQ createManyAndReturn
   */
  export type RFQCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RFQ
     */
    select?: RFQSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RFQ
     */
    omit?: RFQOmit<ExtArgs> | null
    /**
     * The data used to create many RFQS.
     */
    data: RFQCreateManyInput | RFQCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RFQIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RFQ update
   */
  export type RFQUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RFQ
     */
    select?: RFQSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RFQ
     */
    omit?: RFQOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RFQInclude<ExtArgs> | null
    /**
     * The data needed to update a RFQ.
     */
    data: XOR<RFQUpdateInput, RFQUncheckedUpdateInput>
    /**
     * Choose, which RFQ to update.
     */
    where: RFQWhereUniqueInput
  }

  /**
   * RFQ updateMany
   */
  export type RFQUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RFQS.
     */
    data: XOR<RFQUpdateManyMutationInput, RFQUncheckedUpdateManyInput>
    /**
     * Filter which RFQS to update
     */
    where?: RFQWhereInput
    /**
     * Limit how many RFQS to update.
     */
    limit?: number
  }

  /**
   * RFQ updateManyAndReturn
   */
  export type RFQUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RFQ
     */
    select?: RFQSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RFQ
     */
    omit?: RFQOmit<ExtArgs> | null
    /**
     * The data used to update RFQS.
     */
    data: XOR<RFQUpdateManyMutationInput, RFQUncheckedUpdateManyInput>
    /**
     * Filter which RFQS to update
     */
    where?: RFQWhereInput
    /**
     * Limit how many RFQS to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RFQIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * RFQ upsert
   */
  export type RFQUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RFQ
     */
    select?: RFQSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RFQ
     */
    omit?: RFQOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RFQInclude<ExtArgs> | null
    /**
     * The filter to search for the RFQ to update in case it exists.
     */
    where: RFQWhereUniqueInput
    /**
     * In case the RFQ found by the `where` argument doesn't exist, create a new RFQ with this data.
     */
    create: XOR<RFQCreateInput, RFQUncheckedCreateInput>
    /**
     * In case the RFQ was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RFQUpdateInput, RFQUncheckedUpdateInput>
  }

  /**
   * RFQ delete
   */
  export type RFQDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RFQ
     */
    select?: RFQSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RFQ
     */
    omit?: RFQOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RFQInclude<ExtArgs> | null
    /**
     * Filter which RFQ to delete.
     */
    where: RFQWhereUniqueInput
  }

  /**
   * RFQ deleteMany
   */
  export type RFQDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RFQS to delete
     */
    where?: RFQWhereInput
    /**
     * Limit how many RFQS to delete.
     */
    limit?: number
  }

  /**
   * RFQ.invitedSuppliers
   */
  export type RFQ$invitedSuppliersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * RFQ.bids
   */
  export type RFQ$bidsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bid
     */
    select?: BidSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bid
     */
    omit?: BidOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BidInclude<ExtArgs> | null
    where?: BidWhereInput
    orderBy?: BidOrderByWithRelationInput | BidOrderByWithRelationInput[]
    cursor?: BidWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BidScalarFieldEnum | BidScalarFieldEnum[]
  }

  /**
   * RFQ without action
   */
  export type RFQDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RFQ
     */
    select?: RFQSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RFQ
     */
    omit?: RFQOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RFQInclude<ExtArgs> | null
  }


  /**
   * Model Bid
   */

  export type AggregateBid = {
    _count: BidCountAggregateOutputType | null
    _avg: BidAvgAggregateOutputType | null
    _sum: BidSumAggregateOutputType | null
    _min: BidMinAggregateOutputType | null
    _max: BidMaxAggregateOutputType | null
  }

  export type BidAvgAggregateOutputType = {
    price: number | null
    quantity: number | null
  }

  export type BidSumAggregateOutputType = {
    price: number | null
    quantity: number | null
  }

  export type BidMinAggregateOutputType = {
    id: string | null
    price: number | null
    quantity: number | null
    deliveryTime: string | null
    notes: string | null
    status: $Enums.BidStatus | null
    technicalSpecifications: string | null
    termsAndConditions: string | null
    validity: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    rfqId: string | null
    supplierId: string | null
  }

  export type BidMaxAggregateOutputType = {
    id: string | null
    price: number | null
    quantity: number | null
    deliveryTime: string | null
    notes: string | null
    status: $Enums.BidStatus | null
    technicalSpecifications: string | null
    termsAndConditions: string | null
    validity: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    rfqId: string | null
    supplierId: string | null
  }

  export type BidCountAggregateOutputType = {
    id: number
    price: number
    quantity: number
    deliveryTime: number
    notes: number
    status: number
    attachments: number
    technicalSpecifications: number
    termsAndConditions: number
    validity: number
    createdAt: number
    updatedAt: number
    rfqId: number
    supplierId: number
    alternativeOffers: number
    _all: number
  }


  export type BidAvgAggregateInputType = {
    price?: true
    quantity?: true
  }

  export type BidSumAggregateInputType = {
    price?: true
    quantity?: true
  }

  export type BidMinAggregateInputType = {
    id?: true
    price?: true
    quantity?: true
    deliveryTime?: true
    notes?: true
    status?: true
    technicalSpecifications?: true
    termsAndConditions?: true
    validity?: true
    createdAt?: true
    updatedAt?: true
    rfqId?: true
    supplierId?: true
  }

  export type BidMaxAggregateInputType = {
    id?: true
    price?: true
    quantity?: true
    deliveryTime?: true
    notes?: true
    status?: true
    technicalSpecifications?: true
    termsAndConditions?: true
    validity?: true
    createdAt?: true
    updatedAt?: true
    rfqId?: true
    supplierId?: true
  }

  export type BidCountAggregateInputType = {
    id?: true
    price?: true
    quantity?: true
    deliveryTime?: true
    notes?: true
    status?: true
    attachments?: true
    technicalSpecifications?: true
    termsAndConditions?: true
    validity?: true
    createdAt?: true
    updatedAt?: true
    rfqId?: true
    supplierId?: true
    alternativeOffers?: true
    _all?: true
  }

  export type BidAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Bid to aggregate.
     */
    where?: BidWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bids to fetch.
     */
    orderBy?: BidOrderByWithRelationInput | BidOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BidWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bids from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bids.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Bids
    **/
    _count?: true | BidCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BidAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BidSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BidMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BidMaxAggregateInputType
  }

  export type GetBidAggregateType<T extends BidAggregateArgs> = {
        [P in keyof T & keyof AggregateBid]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBid[P]>
      : GetScalarType<T[P], AggregateBid[P]>
  }




  export type BidGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BidWhereInput
    orderBy?: BidOrderByWithAggregationInput | BidOrderByWithAggregationInput[]
    by: BidScalarFieldEnum[] | BidScalarFieldEnum
    having?: BidScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BidCountAggregateInputType | true
    _avg?: BidAvgAggregateInputType
    _sum?: BidSumAggregateInputType
    _min?: BidMinAggregateInputType
    _max?: BidMaxAggregateInputType
  }

  export type BidGroupByOutputType = {
    id: string
    price: number
    quantity: number
    deliveryTime: string
    notes: string | null
    status: $Enums.BidStatus
    attachments: JsonValue | null
    technicalSpecifications: string | null
    termsAndConditions: string | null
    validity: Date
    createdAt: Date
    updatedAt: Date
    rfqId: string
    supplierId: string
    alternativeOffers: JsonValue | null
    _count: BidCountAggregateOutputType | null
    _avg: BidAvgAggregateOutputType | null
    _sum: BidSumAggregateOutputType | null
    _min: BidMinAggregateOutputType | null
    _max: BidMaxAggregateOutputType | null
  }

  type GetBidGroupByPayload<T extends BidGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BidGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BidGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BidGroupByOutputType[P]>
            : GetScalarType<T[P], BidGroupByOutputType[P]>
        }
      >
    >


  export type BidSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    price?: boolean
    quantity?: boolean
    deliveryTime?: boolean
    notes?: boolean
    status?: boolean
    attachments?: boolean
    technicalSpecifications?: boolean
    termsAndConditions?: boolean
    validity?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    rfqId?: boolean
    supplierId?: boolean
    alternativeOffers?: boolean
    rfq?: boolean | RFQDefaultArgs<ExtArgs>
    supplier?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["bid"]>

  export type BidSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    price?: boolean
    quantity?: boolean
    deliveryTime?: boolean
    notes?: boolean
    status?: boolean
    attachments?: boolean
    technicalSpecifications?: boolean
    termsAndConditions?: boolean
    validity?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    rfqId?: boolean
    supplierId?: boolean
    alternativeOffers?: boolean
    rfq?: boolean | RFQDefaultArgs<ExtArgs>
    supplier?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["bid"]>

  export type BidSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    price?: boolean
    quantity?: boolean
    deliveryTime?: boolean
    notes?: boolean
    status?: boolean
    attachments?: boolean
    technicalSpecifications?: boolean
    termsAndConditions?: boolean
    validity?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    rfqId?: boolean
    supplierId?: boolean
    alternativeOffers?: boolean
    rfq?: boolean | RFQDefaultArgs<ExtArgs>
    supplier?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["bid"]>

  export type BidSelectScalar = {
    id?: boolean
    price?: boolean
    quantity?: boolean
    deliveryTime?: boolean
    notes?: boolean
    status?: boolean
    attachments?: boolean
    technicalSpecifications?: boolean
    termsAndConditions?: boolean
    validity?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    rfqId?: boolean
    supplierId?: boolean
    alternativeOffers?: boolean
  }

  export type BidOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "price" | "quantity" | "deliveryTime" | "notes" | "status" | "attachments" | "technicalSpecifications" | "termsAndConditions" | "validity" | "createdAt" | "updatedAt" | "rfqId" | "supplierId" | "alternativeOffers", ExtArgs["result"]["bid"]>
  export type BidInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    rfq?: boolean | RFQDefaultArgs<ExtArgs>
    supplier?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type BidIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    rfq?: boolean | RFQDefaultArgs<ExtArgs>
    supplier?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type BidIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    rfq?: boolean | RFQDefaultArgs<ExtArgs>
    supplier?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $BidPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Bid"
    objects: {
      rfq: Prisma.$RFQPayload<ExtArgs>
      supplier: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      price: number
      quantity: number
      deliveryTime: string
      notes: string | null
      status: $Enums.BidStatus
      attachments: Prisma.JsonValue | null
      technicalSpecifications: string | null
      termsAndConditions: string | null
      validity: Date
      createdAt: Date
      updatedAt: Date
      rfqId: string
      supplierId: string
      alternativeOffers: Prisma.JsonValue | null
    }, ExtArgs["result"]["bid"]>
    composites: {}
  }

  type BidGetPayload<S extends boolean | null | undefined | BidDefaultArgs> = $Result.GetResult<Prisma.$BidPayload, S>

  type BidCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BidFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BidCountAggregateInputType | true
    }

  export interface BidDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Bid'], meta: { name: 'Bid' } }
    /**
     * Find zero or one Bid that matches the filter.
     * @param {BidFindUniqueArgs} args - Arguments to find a Bid
     * @example
     * // Get one Bid
     * const bid = await prisma.bid.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BidFindUniqueArgs>(args: SelectSubset<T, BidFindUniqueArgs<ExtArgs>>): Prisma__BidClient<$Result.GetResult<Prisma.$BidPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Bid that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BidFindUniqueOrThrowArgs} args - Arguments to find a Bid
     * @example
     * // Get one Bid
     * const bid = await prisma.bid.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BidFindUniqueOrThrowArgs>(args: SelectSubset<T, BidFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BidClient<$Result.GetResult<Prisma.$BidPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Bid that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BidFindFirstArgs} args - Arguments to find a Bid
     * @example
     * // Get one Bid
     * const bid = await prisma.bid.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BidFindFirstArgs>(args?: SelectSubset<T, BidFindFirstArgs<ExtArgs>>): Prisma__BidClient<$Result.GetResult<Prisma.$BidPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Bid that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BidFindFirstOrThrowArgs} args - Arguments to find a Bid
     * @example
     * // Get one Bid
     * const bid = await prisma.bid.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BidFindFirstOrThrowArgs>(args?: SelectSubset<T, BidFindFirstOrThrowArgs<ExtArgs>>): Prisma__BidClient<$Result.GetResult<Prisma.$BidPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Bids that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BidFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Bids
     * const bids = await prisma.bid.findMany()
     * 
     * // Get first 10 Bids
     * const bids = await prisma.bid.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const bidWithIdOnly = await prisma.bid.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BidFindManyArgs>(args?: SelectSubset<T, BidFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BidPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Bid.
     * @param {BidCreateArgs} args - Arguments to create a Bid.
     * @example
     * // Create one Bid
     * const Bid = await prisma.bid.create({
     *   data: {
     *     // ... data to create a Bid
     *   }
     * })
     * 
     */
    create<T extends BidCreateArgs>(args: SelectSubset<T, BidCreateArgs<ExtArgs>>): Prisma__BidClient<$Result.GetResult<Prisma.$BidPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Bids.
     * @param {BidCreateManyArgs} args - Arguments to create many Bids.
     * @example
     * // Create many Bids
     * const bid = await prisma.bid.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BidCreateManyArgs>(args?: SelectSubset<T, BidCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Bids and returns the data saved in the database.
     * @param {BidCreateManyAndReturnArgs} args - Arguments to create many Bids.
     * @example
     * // Create many Bids
     * const bid = await prisma.bid.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Bids and only return the `id`
     * const bidWithIdOnly = await prisma.bid.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BidCreateManyAndReturnArgs>(args?: SelectSubset<T, BidCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BidPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Bid.
     * @param {BidDeleteArgs} args - Arguments to delete one Bid.
     * @example
     * // Delete one Bid
     * const Bid = await prisma.bid.delete({
     *   where: {
     *     // ... filter to delete one Bid
     *   }
     * })
     * 
     */
    delete<T extends BidDeleteArgs>(args: SelectSubset<T, BidDeleteArgs<ExtArgs>>): Prisma__BidClient<$Result.GetResult<Prisma.$BidPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Bid.
     * @param {BidUpdateArgs} args - Arguments to update one Bid.
     * @example
     * // Update one Bid
     * const bid = await prisma.bid.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BidUpdateArgs>(args: SelectSubset<T, BidUpdateArgs<ExtArgs>>): Prisma__BidClient<$Result.GetResult<Prisma.$BidPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Bids.
     * @param {BidDeleteManyArgs} args - Arguments to filter Bids to delete.
     * @example
     * // Delete a few Bids
     * const { count } = await prisma.bid.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BidDeleteManyArgs>(args?: SelectSubset<T, BidDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Bids.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BidUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Bids
     * const bid = await prisma.bid.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BidUpdateManyArgs>(args: SelectSubset<T, BidUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Bids and returns the data updated in the database.
     * @param {BidUpdateManyAndReturnArgs} args - Arguments to update many Bids.
     * @example
     * // Update many Bids
     * const bid = await prisma.bid.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Bids and only return the `id`
     * const bidWithIdOnly = await prisma.bid.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BidUpdateManyAndReturnArgs>(args: SelectSubset<T, BidUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BidPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Bid.
     * @param {BidUpsertArgs} args - Arguments to update or create a Bid.
     * @example
     * // Update or create a Bid
     * const bid = await prisma.bid.upsert({
     *   create: {
     *     // ... data to create a Bid
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Bid we want to update
     *   }
     * })
     */
    upsert<T extends BidUpsertArgs>(args: SelectSubset<T, BidUpsertArgs<ExtArgs>>): Prisma__BidClient<$Result.GetResult<Prisma.$BidPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Bids.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BidCountArgs} args - Arguments to filter Bids to count.
     * @example
     * // Count the number of Bids
     * const count = await prisma.bid.count({
     *   where: {
     *     // ... the filter for the Bids we want to count
     *   }
     * })
    **/
    count<T extends BidCountArgs>(
      args?: Subset<T, BidCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BidCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Bid.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BidAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BidAggregateArgs>(args: Subset<T, BidAggregateArgs>): Prisma.PrismaPromise<GetBidAggregateType<T>>

    /**
     * Group by Bid.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BidGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BidGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BidGroupByArgs['orderBy'] }
        : { orderBy?: BidGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BidGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBidGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Bid model
   */
  readonly fields: BidFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Bid.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BidClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    rfq<T extends RFQDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RFQDefaultArgs<ExtArgs>>): Prisma__RFQClient<$Result.GetResult<Prisma.$RFQPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    supplier<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Bid model
   */
  interface BidFieldRefs {
    readonly id: FieldRef<"Bid", 'String'>
    readonly price: FieldRef<"Bid", 'Float'>
    readonly quantity: FieldRef<"Bid", 'Float'>
    readonly deliveryTime: FieldRef<"Bid", 'String'>
    readonly notes: FieldRef<"Bid", 'String'>
    readonly status: FieldRef<"Bid", 'BidStatus'>
    readonly attachments: FieldRef<"Bid", 'Json'>
    readonly technicalSpecifications: FieldRef<"Bid", 'String'>
    readonly termsAndConditions: FieldRef<"Bid", 'String'>
    readonly validity: FieldRef<"Bid", 'DateTime'>
    readonly createdAt: FieldRef<"Bid", 'DateTime'>
    readonly updatedAt: FieldRef<"Bid", 'DateTime'>
    readonly rfqId: FieldRef<"Bid", 'String'>
    readonly supplierId: FieldRef<"Bid", 'String'>
    readonly alternativeOffers: FieldRef<"Bid", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * Bid findUnique
   */
  export type BidFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bid
     */
    select?: BidSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bid
     */
    omit?: BidOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BidInclude<ExtArgs> | null
    /**
     * Filter, which Bid to fetch.
     */
    where: BidWhereUniqueInput
  }

  /**
   * Bid findUniqueOrThrow
   */
  export type BidFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bid
     */
    select?: BidSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bid
     */
    omit?: BidOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BidInclude<ExtArgs> | null
    /**
     * Filter, which Bid to fetch.
     */
    where: BidWhereUniqueInput
  }

  /**
   * Bid findFirst
   */
  export type BidFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bid
     */
    select?: BidSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bid
     */
    omit?: BidOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BidInclude<ExtArgs> | null
    /**
     * Filter, which Bid to fetch.
     */
    where?: BidWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bids to fetch.
     */
    orderBy?: BidOrderByWithRelationInput | BidOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Bids.
     */
    cursor?: BidWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bids from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bids.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Bids.
     */
    distinct?: BidScalarFieldEnum | BidScalarFieldEnum[]
  }

  /**
   * Bid findFirstOrThrow
   */
  export type BidFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bid
     */
    select?: BidSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bid
     */
    omit?: BidOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BidInclude<ExtArgs> | null
    /**
     * Filter, which Bid to fetch.
     */
    where?: BidWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bids to fetch.
     */
    orderBy?: BidOrderByWithRelationInput | BidOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Bids.
     */
    cursor?: BidWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bids from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bids.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Bids.
     */
    distinct?: BidScalarFieldEnum | BidScalarFieldEnum[]
  }

  /**
   * Bid findMany
   */
  export type BidFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bid
     */
    select?: BidSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bid
     */
    omit?: BidOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BidInclude<ExtArgs> | null
    /**
     * Filter, which Bids to fetch.
     */
    where?: BidWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bids to fetch.
     */
    orderBy?: BidOrderByWithRelationInput | BidOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Bids.
     */
    cursor?: BidWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bids from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bids.
     */
    skip?: number
    distinct?: BidScalarFieldEnum | BidScalarFieldEnum[]
  }

  /**
   * Bid create
   */
  export type BidCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bid
     */
    select?: BidSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bid
     */
    omit?: BidOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BidInclude<ExtArgs> | null
    /**
     * The data needed to create a Bid.
     */
    data: XOR<BidCreateInput, BidUncheckedCreateInput>
  }

  /**
   * Bid createMany
   */
  export type BidCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Bids.
     */
    data: BidCreateManyInput | BidCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Bid createManyAndReturn
   */
  export type BidCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bid
     */
    select?: BidSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Bid
     */
    omit?: BidOmit<ExtArgs> | null
    /**
     * The data used to create many Bids.
     */
    data: BidCreateManyInput | BidCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BidIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Bid update
   */
  export type BidUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bid
     */
    select?: BidSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bid
     */
    omit?: BidOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BidInclude<ExtArgs> | null
    /**
     * The data needed to update a Bid.
     */
    data: XOR<BidUpdateInput, BidUncheckedUpdateInput>
    /**
     * Choose, which Bid to update.
     */
    where: BidWhereUniqueInput
  }

  /**
   * Bid updateMany
   */
  export type BidUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Bids.
     */
    data: XOR<BidUpdateManyMutationInput, BidUncheckedUpdateManyInput>
    /**
     * Filter which Bids to update
     */
    where?: BidWhereInput
    /**
     * Limit how many Bids to update.
     */
    limit?: number
  }

  /**
   * Bid updateManyAndReturn
   */
  export type BidUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bid
     */
    select?: BidSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Bid
     */
    omit?: BidOmit<ExtArgs> | null
    /**
     * The data used to update Bids.
     */
    data: XOR<BidUpdateManyMutationInput, BidUncheckedUpdateManyInput>
    /**
     * Filter which Bids to update
     */
    where?: BidWhereInput
    /**
     * Limit how many Bids to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BidIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Bid upsert
   */
  export type BidUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bid
     */
    select?: BidSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bid
     */
    omit?: BidOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BidInclude<ExtArgs> | null
    /**
     * The filter to search for the Bid to update in case it exists.
     */
    where: BidWhereUniqueInput
    /**
     * In case the Bid found by the `where` argument doesn't exist, create a new Bid with this data.
     */
    create: XOR<BidCreateInput, BidUncheckedCreateInput>
    /**
     * In case the Bid was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BidUpdateInput, BidUncheckedUpdateInput>
  }

  /**
   * Bid delete
   */
  export type BidDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bid
     */
    select?: BidSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bid
     */
    omit?: BidOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BidInclude<ExtArgs> | null
    /**
     * Filter which Bid to delete.
     */
    where: BidWhereUniqueInput
  }

  /**
   * Bid deleteMany
   */
  export type BidDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Bids to delete
     */
    where?: BidWhereInput
    /**
     * Limit how many Bids to delete.
     */
    limit?: number
  }

  /**
   * Bid without action
   */
  export type BidDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bid
     */
    select?: BidSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bid
     */
    omit?: BidOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BidInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    name: 'name',
    password: 'password',
    role: 'role',
    isEmailVerified: 'isEmailVerified',
    verificationToken: 'verificationToken',
    resetPasswordToken: 'resetPasswordToken',
    resetPasswordExpires: 'resetPasswordExpires',
    lastLoginAt: 'lastLoginAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    companyId: 'companyId'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const CompanyScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    industry: 'industry',
    website: 'website',
    address: 'address',
    phone: 'phone',
    email: 'email',
    logoUrl: 'logoUrl',
    isVerified: 'isVerified',
    averageRating: 'averageRating',
    registrationNumber: 'registrationNumber',
    taxId: 'taxId',
    foundedYear: 'foundedYear',
    employeeCount: 'employeeCount',
    annualRevenue: 'annualRevenue',
    certifications: 'certifications',
    serviceAreas: 'serviceAreas',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CompanyScalarFieldEnum = (typeof CompanyScalarFieldEnum)[keyof typeof CompanyScalarFieldEnum]


  export const ProductScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    category: 'category',
    price: 'price',
    unit: 'unit',
    minimumOrderQuantity: 'minimumOrderQuantity',
    supplyAbility: 'supplyAbility',
    specifications: 'specifications',
    images: 'images',
    videos: 'videos',
    keywords: 'keywords',
    companyId: 'companyId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ProductScalarFieldEnum = (typeof ProductScalarFieldEnum)[keyof typeof ProductScalarFieldEnum]


  export const RFQScalarFieldEnum: {
    id: 'id',
    title: 'title',
    description: 'description',
    category: 'category',
    quantity: 'quantity',
    unit: 'unit',
    deadline: 'deadline',
    status: 'status',
    attachments: 'attachments',
    minBudget: 'minBudget',
    maxBudget: 'maxBudget',
    preferredDeliveryDate: 'preferredDeliveryDate',
    deliveryLocation: 'deliveryLocation',
    requirementsDocument: 'requirementsDocument',
    qualificationCriteria: 'qualificationCriteria',
    tags: 'tags',
    visibility: 'visibility',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    userId: 'userId'
  };

  export type RFQScalarFieldEnum = (typeof RFQScalarFieldEnum)[keyof typeof RFQScalarFieldEnum]


  export const BidScalarFieldEnum: {
    id: 'id',
    price: 'price',
    quantity: 'quantity',
    deliveryTime: 'deliveryTime',
    notes: 'notes',
    status: 'status',
    attachments: 'attachments',
    technicalSpecifications: 'technicalSpecifications',
    termsAndConditions: 'termsAndConditions',
    validity: 'validity',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    rfqId: 'rfqId',
    supplierId: 'supplierId',
    alternativeOffers: 'alternativeOffers'
  };

  export type BidScalarFieldEnum = (typeof BidScalarFieldEnum)[keyof typeof BidScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Role'
   */
  export type EnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role'>
    


  /**
   * Reference to a field of type 'Role[]'
   */
  export type ListEnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'RFQStatus'
   */
  export type EnumRFQStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RFQStatus'>
    


  /**
   * Reference to a field of type 'RFQStatus[]'
   */
  export type ListEnumRFQStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RFQStatus[]'>
    


  /**
   * Reference to a field of type 'Visibility'
   */
  export type EnumVisibilityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Visibility'>
    


  /**
   * Reference to a field of type 'Visibility[]'
   */
  export type ListEnumVisibilityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Visibility[]'>
    


  /**
   * Reference to a field of type 'BidStatus'
   */
  export type EnumBidStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BidStatus'>
    


  /**
   * Reference to a field of type 'BidStatus[]'
   */
  export type ListEnumBidStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BidStatus[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    isEmailVerified?: BoolFilter<"User"> | boolean
    verificationToken?: StringNullableFilter<"User"> | string | null
    resetPasswordToken?: StringNullableFilter<"User"> | string | null
    resetPasswordExpires?: DateTimeNullableFilter<"User"> | Date | string | null
    lastLoginAt?: DateTimeNullableFilter<"User"> | Date | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    companyId?: StringFilter<"User"> | string
    company?: XOR<CompanyScalarRelationFilter, CompanyWhereInput>
    createdRfqs?: RFQListRelationFilter
    bids?: BidListRelationFilter
    invitedToRfqs?: RFQListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    role?: SortOrder
    isEmailVerified?: SortOrder
    verificationToken?: SortOrderInput | SortOrder
    resetPasswordToken?: SortOrderInput | SortOrder
    resetPasswordExpires?: SortOrderInput | SortOrder
    lastLoginAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    companyId?: SortOrder
    company?: CompanyOrderByWithRelationInput
    createdRfqs?: RFQOrderByRelationAggregateInput
    bids?: BidOrderByRelationAggregateInput
    invitedToRfqs?: RFQOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    isEmailVerified?: BoolFilter<"User"> | boolean
    verificationToken?: StringNullableFilter<"User"> | string | null
    resetPasswordToken?: StringNullableFilter<"User"> | string | null
    resetPasswordExpires?: DateTimeNullableFilter<"User"> | Date | string | null
    lastLoginAt?: DateTimeNullableFilter<"User"> | Date | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    companyId?: StringFilter<"User"> | string
    company?: XOR<CompanyScalarRelationFilter, CompanyWhereInput>
    createdRfqs?: RFQListRelationFilter
    bids?: BidListRelationFilter
    invitedToRfqs?: RFQListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    role?: SortOrder
    isEmailVerified?: SortOrder
    verificationToken?: SortOrderInput | SortOrder
    resetPasswordToken?: SortOrderInput | SortOrder
    resetPasswordExpires?: SortOrderInput | SortOrder
    lastLoginAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    companyId?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    name?: StringWithAggregatesFilter<"User"> | string
    password?: StringWithAggregatesFilter<"User"> | string
    role?: EnumRoleWithAggregatesFilter<"User"> | $Enums.Role
    isEmailVerified?: BoolWithAggregatesFilter<"User"> | boolean
    verificationToken?: StringNullableWithAggregatesFilter<"User"> | string | null
    resetPasswordToken?: StringNullableWithAggregatesFilter<"User"> | string | null
    resetPasswordExpires?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    lastLoginAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    companyId?: StringWithAggregatesFilter<"User"> | string
  }

  export type CompanyWhereInput = {
    AND?: CompanyWhereInput | CompanyWhereInput[]
    OR?: CompanyWhereInput[]
    NOT?: CompanyWhereInput | CompanyWhereInput[]
    id?: StringFilter<"Company"> | string
    name?: StringFilter<"Company"> | string
    description?: StringNullableFilter<"Company"> | string | null
    industry?: StringNullableFilter<"Company"> | string | null
    website?: StringNullableFilter<"Company"> | string | null
    address?: StringNullableFilter<"Company"> | string | null
    phone?: StringNullableFilter<"Company"> | string | null
    email?: StringNullableFilter<"Company"> | string | null
    logoUrl?: StringNullableFilter<"Company"> | string | null
    isVerified?: BoolFilter<"Company"> | boolean
    averageRating?: FloatNullableFilter<"Company"> | number | null
    registrationNumber?: StringNullableFilter<"Company"> | string | null
    taxId?: StringNullableFilter<"Company"> | string | null
    foundedYear?: IntNullableFilter<"Company"> | number | null
    employeeCount?: IntNullableFilter<"Company"> | number | null
    annualRevenue?: FloatNullableFilter<"Company"> | number | null
    certifications?: JsonNullableFilter<"Company">
    serviceAreas?: JsonNullableFilter<"Company">
    createdAt?: DateTimeFilter<"Company"> | Date | string
    updatedAt?: DateTimeFilter<"Company"> | Date | string
    users?: UserListRelationFilter
    products?: ProductListRelationFilter
  }

  export type CompanyOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    industry?: SortOrderInput | SortOrder
    website?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    phone?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    logoUrl?: SortOrderInput | SortOrder
    isVerified?: SortOrder
    averageRating?: SortOrderInput | SortOrder
    registrationNumber?: SortOrderInput | SortOrder
    taxId?: SortOrderInput | SortOrder
    foundedYear?: SortOrderInput | SortOrder
    employeeCount?: SortOrderInput | SortOrder
    annualRevenue?: SortOrderInput | SortOrder
    certifications?: SortOrderInput | SortOrder
    serviceAreas?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    users?: UserOrderByRelationAggregateInput
    products?: ProductOrderByRelationAggregateInput
  }

  export type CompanyWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CompanyWhereInput | CompanyWhereInput[]
    OR?: CompanyWhereInput[]
    NOT?: CompanyWhereInput | CompanyWhereInput[]
    name?: StringFilter<"Company"> | string
    description?: StringNullableFilter<"Company"> | string | null
    industry?: StringNullableFilter<"Company"> | string | null
    website?: StringNullableFilter<"Company"> | string | null
    address?: StringNullableFilter<"Company"> | string | null
    phone?: StringNullableFilter<"Company"> | string | null
    email?: StringNullableFilter<"Company"> | string | null
    logoUrl?: StringNullableFilter<"Company"> | string | null
    isVerified?: BoolFilter<"Company"> | boolean
    averageRating?: FloatNullableFilter<"Company"> | number | null
    registrationNumber?: StringNullableFilter<"Company"> | string | null
    taxId?: StringNullableFilter<"Company"> | string | null
    foundedYear?: IntNullableFilter<"Company"> | number | null
    employeeCount?: IntNullableFilter<"Company"> | number | null
    annualRevenue?: FloatNullableFilter<"Company"> | number | null
    certifications?: JsonNullableFilter<"Company">
    serviceAreas?: JsonNullableFilter<"Company">
    createdAt?: DateTimeFilter<"Company"> | Date | string
    updatedAt?: DateTimeFilter<"Company"> | Date | string
    users?: UserListRelationFilter
    products?: ProductListRelationFilter
  }, "id">

  export type CompanyOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    industry?: SortOrderInput | SortOrder
    website?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    phone?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    logoUrl?: SortOrderInput | SortOrder
    isVerified?: SortOrder
    averageRating?: SortOrderInput | SortOrder
    registrationNumber?: SortOrderInput | SortOrder
    taxId?: SortOrderInput | SortOrder
    foundedYear?: SortOrderInput | SortOrder
    employeeCount?: SortOrderInput | SortOrder
    annualRevenue?: SortOrderInput | SortOrder
    certifications?: SortOrderInput | SortOrder
    serviceAreas?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CompanyCountOrderByAggregateInput
    _avg?: CompanyAvgOrderByAggregateInput
    _max?: CompanyMaxOrderByAggregateInput
    _min?: CompanyMinOrderByAggregateInput
    _sum?: CompanySumOrderByAggregateInput
  }

  export type CompanyScalarWhereWithAggregatesInput = {
    AND?: CompanyScalarWhereWithAggregatesInput | CompanyScalarWhereWithAggregatesInput[]
    OR?: CompanyScalarWhereWithAggregatesInput[]
    NOT?: CompanyScalarWhereWithAggregatesInput | CompanyScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Company"> | string
    name?: StringWithAggregatesFilter<"Company"> | string
    description?: StringNullableWithAggregatesFilter<"Company"> | string | null
    industry?: StringNullableWithAggregatesFilter<"Company"> | string | null
    website?: StringNullableWithAggregatesFilter<"Company"> | string | null
    address?: StringNullableWithAggregatesFilter<"Company"> | string | null
    phone?: StringNullableWithAggregatesFilter<"Company"> | string | null
    email?: StringNullableWithAggregatesFilter<"Company"> | string | null
    logoUrl?: StringNullableWithAggregatesFilter<"Company"> | string | null
    isVerified?: BoolWithAggregatesFilter<"Company"> | boolean
    averageRating?: FloatNullableWithAggregatesFilter<"Company"> | number | null
    registrationNumber?: StringNullableWithAggregatesFilter<"Company"> | string | null
    taxId?: StringNullableWithAggregatesFilter<"Company"> | string | null
    foundedYear?: IntNullableWithAggregatesFilter<"Company"> | number | null
    employeeCount?: IntNullableWithAggregatesFilter<"Company"> | number | null
    annualRevenue?: FloatNullableWithAggregatesFilter<"Company"> | number | null
    certifications?: JsonNullableWithAggregatesFilter<"Company">
    serviceAreas?: JsonNullableWithAggregatesFilter<"Company">
    createdAt?: DateTimeWithAggregatesFilter<"Company"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Company"> | Date | string
  }

  export type ProductWhereInput = {
    AND?: ProductWhereInput | ProductWhereInput[]
    OR?: ProductWhereInput[]
    NOT?: ProductWhereInput | ProductWhereInput[]
    id?: StringFilter<"Product"> | string
    name?: StringFilter<"Product"> | string
    description?: StringNullableFilter<"Product"> | string | null
    category?: StringNullableFilter<"Product"> | string | null
    price?: FloatNullableFilter<"Product"> | number | null
    unit?: StringNullableFilter<"Product"> | string | null
    minimumOrderQuantity?: IntNullableFilter<"Product"> | number | null
    supplyAbility?: StringNullableFilter<"Product"> | string | null
    specifications?: JsonNullableFilter<"Product">
    images?: JsonNullableFilter<"Product">
    videos?: JsonNullableFilter<"Product">
    keywords?: JsonNullableFilter<"Product">
    companyId?: StringFilter<"Product"> | string
    createdAt?: DateTimeFilter<"Product"> | Date | string
    updatedAt?: DateTimeFilter<"Product"> | Date | string
    company?: XOR<CompanyScalarRelationFilter, CompanyWhereInput>
  }

  export type ProductOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    category?: SortOrderInput | SortOrder
    price?: SortOrderInput | SortOrder
    unit?: SortOrderInput | SortOrder
    minimumOrderQuantity?: SortOrderInput | SortOrder
    supplyAbility?: SortOrderInput | SortOrder
    specifications?: SortOrderInput | SortOrder
    images?: SortOrderInput | SortOrder
    videos?: SortOrderInput | SortOrder
    keywords?: SortOrderInput | SortOrder
    companyId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    company?: CompanyOrderByWithRelationInput
  }

  export type ProductWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ProductWhereInput | ProductWhereInput[]
    OR?: ProductWhereInput[]
    NOT?: ProductWhereInput | ProductWhereInput[]
    name?: StringFilter<"Product"> | string
    description?: StringNullableFilter<"Product"> | string | null
    category?: StringNullableFilter<"Product"> | string | null
    price?: FloatNullableFilter<"Product"> | number | null
    unit?: StringNullableFilter<"Product"> | string | null
    minimumOrderQuantity?: IntNullableFilter<"Product"> | number | null
    supplyAbility?: StringNullableFilter<"Product"> | string | null
    specifications?: JsonNullableFilter<"Product">
    images?: JsonNullableFilter<"Product">
    videos?: JsonNullableFilter<"Product">
    keywords?: JsonNullableFilter<"Product">
    companyId?: StringFilter<"Product"> | string
    createdAt?: DateTimeFilter<"Product"> | Date | string
    updatedAt?: DateTimeFilter<"Product"> | Date | string
    company?: XOR<CompanyScalarRelationFilter, CompanyWhereInput>
  }, "id">

  export type ProductOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    category?: SortOrderInput | SortOrder
    price?: SortOrderInput | SortOrder
    unit?: SortOrderInput | SortOrder
    minimumOrderQuantity?: SortOrderInput | SortOrder
    supplyAbility?: SortOrderInput | SortOrder
    specifications?: SortOrderInput | SortOrder
    images?: SortOrderInput | SortOrder
    videos?: SortOrderInput | SortOrder
    keywords?: SortOrderInput | SortOrder
    companyId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ProductCountOrderByAggregateInput
    _avg?: ProductAvgOrderByAggregateInput
    _max?: ProductMaxOrderByAggregateInput
    _min?: ProductMinOrderByAggregateInput
    _sum?: ProductSumOrderByAggregateInput
  }

  export type ProductScalarWhereWithAggregatesInput = {
    AND?: ProductScalarWhereWithAggregatesInput | ProductScalarWhereWithAggregatesInput[]
    OR?: ProductScalarWhereWithAggregatesInput[]
    NOT?: ProductScalarWhereWithAggregatesInput | ProductScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Product"> | string
    name?: StringWithAggregatesFilter<"Product"> | string
    description?: StringNullableWithAggregatesFilter<"Product"> | string | null
    category?: StringNullableWithAggregatesFilter<"Product"> | string | null
    price?: FloatNullableWithAggregatesFilter<"Product"> | number | null
    unit?: StringNullableWithAggregatesFilter<"Product"> | string | null
    minimumOrderQuantity?: IntNullableWithAggregatesFilter<"Product"> | number | null
    supplyAbility?: StringNullableWithAggregatesFilter<"Product"> | string | null
    specifications?: JsonNullableWithAggregatesFilter<"Product">
    images?: JsonNullableWithAggregatesFilter<"Product">
    videos?: JsonNullableWithAggregatesFilter<"Product">
    keywords?: JsonNullableWithAggregatesFilter<"Product">
    companyId?: StringWithAggregatesFilter<"Product"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Product"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Product"> | Date | string
  }

  export type RFQWhereInput = {
    AND?: RFQWhereInput | RFQWhereInput[]
    OR?: RFQWhereInput[]
    NOT?: RFQWhereInput | RFQWhereInput[]
    id?: StringFilter<"RFQ"> | string
    title?: StringFilter<"RFQ"> | string
    description?: StringFilter<"RFQ"> | string
    category?: StringFilter<"RFQ"> | string
    quantity?: FloatFilter<"RFQ"> | number
    unit?: StringFilter<"RFQ"> | string
    deadline?: DateTimeFilter<"RFQ"> | Date | string
    status?: EnumRFQStatusFilter<"RFQ"> | $Enums.RFQStatus
    attachments?: JsonNullableFilter<"RFQ">
    minBudget?: FloatNullableFilter<"RFQ"> | number | null
    maxBudget?: FloatNullableFilter<"RFQ"> | number | null
    preferredDeliveryDate?: DateTimeNullableFilter<"RFQ"> | Date | string | null
    deliveryLocation?: StringNullableFilter<"RFQ"> | string | null
    requirementsDocument?: StringNullableFilter<"RFQ"> | string | null
    qualificationCriteria?: StringNullableListFilter<"RFQ">
    tags?: StringNullableListFilter<"RFQ">
    visibility?: EnumVisibilityFilter<"RFQ"> | $Enums.Visibility
    createdAt?: DateTimeFilter<"RFQ"> | Date | string
    updatedAt?: DateTimeFilter<"RFQ"> | Date | string
    userId?: StringFilter<"RFQ"> | string
    createdBy?: XOR<UserScalarRelationFilter, UserWhereInput>
    invitedSuppliers?: UserListRelationFilter
    bids?: BidListRelationFilter
  }

  export type RFQOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    category?: SortOrder
    quantity?: SortOrder
    unit?: SortOrder
    deadline?: SortOrder
    status?: SortOrder
    attachments?: SortOrderInput | SortOrder
    minBudget?: SortOrderInput | SortOrder
    maxBudget?: SortOrderInput | SortOrder
    preferredDeliveryDate?: SortOrderInput | SortOrder
    deliveryLocation?: SortOrderInput | SortOrder
    requirementsDocument?: SortOrderInput | SortOrder
    qualificationCriteria?: SortOrder
    tags?: SortOrder
    visibility?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    createdBy?: UserOrderByWithRelationInput
    invitedSuppliers?: UserOrderByRelationAggregateInput
    bids?: BidOrderByRelationAggregateInput
  }

  export type RFQWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RFQWhereInput | RFQWhereInput[]
    OR?: RFQWhereInput[]
    NOT?: RFQWhereInput | RFQWhereInput[]
    title?: StringFilter<"RFQ"> | string
    description?: StringFilter<"RFQ"> | string
    category?: StringFilter<"RFQ"> | string
    quantity?: FloatFilter<"RFQ"> | number
    unit?: StringFilter<"RFQ"> | string
    deadline?: DateTimeFilter<"RFQ"> | Date | string
    status?: EnumRFQStatusFilter<"RFQ"> | $Enums.RFQStatus
    attachments?: JsonNullableFilter<"RFQ">
    minBudget?: FloatNullableFilter<"RFQ"> | number | null
    maxBudget?: FloatNullableFilter<"RFQ"> | number | null
    preferredDeliveryDate?: DateTimeNullableFilter<"RFQ"> | Date | string | null
    deliveryLocation?: StringNullableFilter<"RFQ"> | string | null
    requirementsDocument?: StringNullableFilter<"RFQ"> | string | null
    qualificationCriteria?: StringNullableListFilter<"RFQ">
    tags?: StringNullableListFilter<"RFQ">
    visibility?: EnumVisibilityFilter<"RFQ"> | $Enums.Visibility
    createdAt?: DateTimeFilter<"RFQ"> | Date | string
    updatedAt?: DateTimeFilter<"RFQ"> | Date | string
    userId?: StringFilter<"RFQ"> | string
    createdBy?: XOR<UserScalarRelationFilter, UserWhereInput>
    invitedSuppliers?: UserListRelationFilter
    bids?: BidListRelationFilter
  }, "id">

  export type RFQOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    category?: SortOrder
    quantity?: SortOrder
    unit?: SortOrder
    deadline?: SortOrder
    status?: SortOrder
    attachments?: SortOrderInput | SortOrder
    minBudget?: SortOrderInput | SortOrder
    maxBudget?: SortOrderInput | SortOrder
    preferredDeliveryDate?: SortOrderInput | SortOrder
    deliveryLocation?: SortOrderInput | SortOrder
    requirementsDocument?: SortOrderInput | SortOrder
    qualificationCriteria?: SortOrder
    tags?: SortOrder
    visibility?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    _count?: RFQCountOrderByAggregateInput
    _avg?: RFQAvgOrderByAggregateInput
    _max?: RFQMaxOrderByAggregateInput
    _min?: RFQMinOrderByAggregateInput
    _sum?: RFQSumOrderByAggregateInput
  }

  export type RFQScalarWhereWithAggregatesInput = {
    AND?: RFQScalarWhereWithAggregatesInput | RFQScalarWhereWithAggregatesInput[]
    OR?: RFQScalarWhereWithAggregatesInput[]
    NOT?: RFQScalarWhereWithAggregatesInput | RFQScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"RFQ"> | string
    title?: StringWithAggregatesFilter<"RFQ"> | string
    description?: StringWithAggregatesFilter<"RFQ"> | string
    category?: StringWithAggregatesFilter<"RFQ"> | string
    quantity?: FloatWithAggregatesFilter<"RFQ"> | number
    unit?: StringWithAggregatesFilter<"RFQ"> | string
    deadline?: DateTimeWithAggregatesFilter<"RFQ"> | Date | string
    status?: EnumRFQStatusWithAggregatesFilter<"RFQ"> | $Enums.RFQStatus
    attachments?: JsonNullableWithAggregatesFilter<"RFQ">
    minBudget?: FloatNullableWithAggregatesFilter<"RFQ"> | number | null
    maxBudget?: FloatNullableWithAggregatesFilter<"RFQ"> | number | null
    preferredDeliveryDate?: DateTimeNullableWithAggregatesFilter<"RFQ"> | Date | string | null
    deliveryLocation?: StringNullableWithAggregatesFilter<"RFQ"> | string | null
    requirementsDocument?: StringNullableWithAggregatesFilter<"RFQ"> | string | null
    qualificationCriteria?: StringNullableListFilter<"RFQ">
    tags?: StringNullableListFilter<"RFQ">
    visibility?: EnumVisibilityWithAggregatesFilter<"RFQ"> | $Enums.Visibility
    createdAt?: DateTimeWithAggregatesFilter<"RFQ"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"RFQ"> | Date | string
    userId?: StringWithAggregatesFilter<"RFQ"> | string
  }

  export type BidWhereInput = {
    AND?: BidWhereInput | BidWhereInput[]
    OR?: BidWhereInput[]
    NOT?: BidWhereInput | BidWhereInput[]
    id?: StringFilter<"Bid"> | string
    price?: FloatFilter<"Bid"> | number
    quantity?: FloatFilter<"Bid"> | number
    deliveryTime?: StringFilter<"Bid"> | string
    notes?: StringNullableFilter<"Bid"> | string | null
    status?: EnumBidStatusFilter<"Bid"> | $Enums.BidStatus
    attachments?: JsonNullableFilter<"Bid">
    technicalSpecifications?: StringNullableFilter<"Bid"> | string | null
    termsAndConditions?: StringNullableFilter<"Bid"> | string | null
    validity?: DateTimeFilter<"Bid"> | Date | string
    createdAt?: DateTimeFilter<"Bid"> | Date | string
    updatedAt?: DateTimeFilter<"Bid"> | Date | string
    rfqId?: StringFilter<"Bid"> | string
    supplierId?: StringFilter<"Bid"> | string
    alternativeOffers?: JsonNullableFilter<"Bid">
    rfq?: XOR<RFQScalarRelationFilter, RFQWhereInput>
    supplier?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type BidOrderByWithRelationInput = {
    id?: SortOrder
    price?: SortOrder
    quantity?: SortOrder
    deliveryTime?: SortOrder
    notes?: SortOrderInput | SortOrder
    status?: SortOrder
    attachments?: SortOrderInput | SortOrder
    technicalSpecifications?: SortOrderInput | SortOrder
    termsAndConditions?: SortOrderInput | SortOrder
    validity?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    rfqId?: SortOrder
    supplierId?: SortOrder
    alternativeOffers?: SortOrderInput | SortOrder
    rfq?: RFQOrderByWithRelationInput
    supplier?: UserOrderByWithRelationInput
  }

  export type BidWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: BidWhereInput | BidWhereInput[]
    OR?: BidWhereInput[]
    NOT?: BidWhereInput | BidWhereInput[]
    price?: FloatFilter<"Bid"> | number
    quantity?: FloatFilter<"Bid"> | number
    deliveryTime?: StringFilter<"Bid"> | string
    notes?: StringNullableFilter<"Bid"> | string | null
    status?: EnumBidStatusFilter<"Bid"> | $Enums.BidStatus
    attachments?: JsonNullableFilter<"Bid">
    technicalSpecifications?: StringNullableFilter<"Bid"> | string | null
    termsAndConditions?: StringNullableFilter<"Bid"> | string | null
    validity?: DateTimeFilter<"Bid"> | Date | string
    createdAt?: DateTimeFilter<"Bid"> | Date | string
    updatedAt?: DateTimeFilter<"Bid"> | Date | string
    rfqId?: StringFilter<"Bid"> | string
    supplierId?: StringFilter<"Bid"> | string
    alternativeOffers?: JsonNullableFilter<"Bid">
    rfq?: XOR<RFQScalarRelationFilter, RFQWhereInput>
    supplier?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type BidOrderByWithAggregationInput = {
    id?: SortOrder
    price?: SortOrder
    quantity?: SortOrder
    deliveryTime?: SortOrder
    notes?: SortOrderInput | SortOrder
    status?: SortOrder
    attachments?: SortOrderInput | SortOrder
    technicalSpecifications?: SortOrderInput | SortOrder
    termsAndConditions?: SortOrderInput | SortOrder
    validity?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    rfqId?: SortOrder
    supplierId?: SortOrder
    alternativeOffers?: SortOrderInput | SortOrder
    _count?: BidCountOrderByAggregateInput
    _avg?: BidAvgOrderByAggregateInput
    _max?: BidMaxOrderByAggregateInput
    _min?: BidMinOrderByAggregateInput
    _sum?: BidSumOrderByAggregateInput
  }

  export type BidScalarWhereWithAggregatesInput = {
    AND?: BidScalarWhereWithAggregatesInput | BidScalarWhereWithAggregatesInput[]
    OR?: BidScalarWhereWithAggregatesInput[]
    NOT?: BidScalarWhereWithAggregatesInput | BidScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Bid"> | string
    price?: FloatWithAggregatesFilter<"Bid"> | number
    quantity?: FloatWithAggregatesFilter<"Bid"> | number
    deliveryTime?: StringWithAggregatesFilter<"Bid"> | string
    notes?: StringNullableWithAggregatesFilter<"Bid"> | string | null
    status?: EnumBidStatusWithAggregatesFilter<"Bid"> | $Enums.BidStatus
    attachments?: JsonNullableWithAggregatesFilter<"Bid">
    technicalSpecifications?: StringNullableWithAggregatesFilter<"Bid"> | string | null
    termsAndConditions?: StringNullableWithAggregatesFilter<"Bid"> | string | null
    validity?: DateTimeWithAggregatesFilter<"Bid"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"Bid"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Bid"> | Date | string
    rfqId?: StringWithAggregatesFilter<"Bid"> | string
    supplierId?: StringWithAggregatesFilter<"Bid"> | string
    alternativeOffers?: JsonNullableWithAggregatesFilter<"Bid">
  }

  export type UserCreateInput = {
    id?: string
    email: string
    name: string
    password: string
    role?: $Enums.Role
    isEmailVerified?: boolean
    verificationToken?: string | null
    resetPasswordToken?: string | null
    resetPasswordExpires?: Date | string | null
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    company: CompanyCreateNestedOneWithoutUsersInput
    createdRfqs?: RFQCreateNestedManyWithoutCreatedByInput
    bids?: BidCreateNestedManyWithoutSupplierInput
    invitedToRfqs?: RFQCreateNestedManyWithoutInvitedSuppliersInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    name: string
    password: string
    role?: $Enums.Role
    isEmailVerified?: boolean
    verificationToken?: string | null
    resetPasswordToken?: string | null
    resetPasswordExpires?: Date | string | null
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    companyId: string
    createdRfqs?: RFQUncheckedCreateNestedManyWithoutCreatedByInput
    bids?: BidUncheckedCreateNestedManyWithoutSupplierInput
    invitedToRfqs?: RFQUncheckedCreateNestedManyWithoutInvitedSuppliersInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isEmailVerified?: BoolFieldUpdateOperationsInput | boolean
    verificationToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordExpires?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    company?: CompanyUpdateOneRequiredWithoutUsersNestedInput
    createdRfqs?: RFQUpdateManyWithoutCreatedByNestedInput
    bids?: BidUpdateManyWithoutSupplierNestedInput
    invitedToRfqs?: RFQUpdateManyWithoutInvitedSuppliersNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isEmailVerified?: BoolFieldUpdateOperationsInput | boolean
    verificationToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordExpires?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    companyId?: StringFieldUpdateOperationsInput | string
    createdRfqs?: RFQUncheckedUpdateManyWithoutCreatedByNestedInput
    bids?: BidUncheckedUpdateManyWithoutSupplierNestedInput
    invitedToRfqs?: RFQUncheckedUpdateManyWithoutInvitedSuppliersNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    name: string
    password: string
    role?: $Enums.Role
    isEmailVerified?: boolean
    verificationToken?: string | null
    resetPasswordToken?: string | null
    resetPasswordExpires?: Date | string | null
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    companyId: string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isEmailVerified?: BoolFieldUpdateOperationsInput | boolean
    verificationToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordExpires?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isEmailVerified?: BoolFieldUpdateOperationsInput | boolean
    verificationToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordExpires?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    companyId?: StringFieldUpdateOperationsInput | string
  }

  export type CompanyCreateInput = {
    id?: string
    name: string
    description?: string | null
    industry?: string | null
    website?: string | null
    address?: string | null
    phone?: string | null
    email?: string | null
    logoUrl?: string | null
    isVerified?: boolean
    averageRating?: number | null
    registrationNumber?: string | null
    taxId?: string | null
    foundedYear?: number | null
    employeeCount?: number | null
    annualRevenue?: number | null
    certifications?: NullableJsonNullValueInput | InputJsonValue
    serviceAreas?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserCreateNestedManyWithoutCompanyInput
    products?: ProductCreateNestedManyWithoutCompanyInput
  }

  export type CompanyUncheckedCreateInput = {
    id?: string
    name: string
    description?: string | null
    industry?: string | null
    website?: string | null
    address?: string | null
    phone?: string | null
    email?: string | null
    logoUrl?: string | null
    isVerified?: boolean
    averageRating?: number | null
    registrationNumber?: string | null
    taxId?: string | null
    foundedYear?: number | null
    employeeCount?: number | null
    annualRevenue?: number | null
    certifications?: NullableJsonNullValueInput | InputJsonValue
    serviceAreas?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutCompanyInput
    products?: ProductUncheckedCreateNestedManyWithoutCompanyInput
  }

  export type CompanyUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    industry?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    averageRating?: NullableFloatFieldUpdateOperationsInput | number | null
    registrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    taxId?: NullableStringFieldUpdateOperationsInput | string | null
    foundedYear?: NullableIntFieldUpdateOperationsInput | number | null
    employeeCount?: NullableIntFieldUpdateOperationsInput | number | null
    annualRevenue?: NullableFloatFieldUpdateOperationsInput | number | null
    certifications?: NullableJsonNullValueInput | InputJsonValue
    serviceAreas?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutCompanyNestedInput
    products?: ProductUpdateManyWithoutCompanyNestedInput
  }

  export type CompanyUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    industry?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    averageRating?: NullableFloatFieldUpdateOperationsInput | number | null
    registrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    taxId?: NullableStringFieldUpdateOperationsInput | string | null
    foundedYear?: NullableIntFieldUpdateOperationsInput | number | null
    employeeCount?: NullableIntFieldUpdateOperationsInput | number | null
    annualRevenue?: NullableFloatFieldUpdateOperationsInput | number | null
    certifications?: NullableJsonNullValueInput | InputJsonValue
    serviceAreas?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutCompanyNestedInput
    products?: ProductUncheckedUpdateManyWithoutCompanyNestedInput
  }

  export type CompanyCreateManyInput = {
    id?: string
    name: string
    description?: string | null
    industry?: string | null
    website?: string | null
    address?: string | null
    phone?: string | null
    email?: string | null
    logoUrl?: string | null
    isVerified?: boolean
    averageRating?: number | null
    registrationNumber?: string | null
    taxId?: string | null
    foundedYear?: number | null
    employeeCount?: number | null
    annualRevenue?: number | null
    certifications?: NullableJsonNullValueInput | InputJsonValue
    serviceAreas?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CompanyUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    industry?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    averageRating?: NullableFloatFieldUpdateOperationsInput | number | null
    registrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    taxId?: NullableStringFieldUpdateOperationsInput | string | null
    foundedYear?: NullableIntFieldUpdateOperationsInput | number | null
    employeeCount?: NullableIntFieldUpdateOperationsInput | number | null
    annualRevenue?: NullableFloatFieldUpdateOperationsInput | number | null
    certifications?: NullableJsonNullValueInput | InputJsonValue
    serviceAreas?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CompanyUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    industry?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    averageRating?: NullableFloatFieldUpdateOperationsInput | number | null
    registrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    taxId?: NullableStringFieldUpdateOperationsInput | string | null
    foundedYear?: NullableIntFieldUpdateOperationsInput | number | null
    employeeCount?: NullableIntFieldUpdateOperationsInput | number | null
    annualRevenue?: NullableFloatFieldUpdateOperationsInput | number | null
    certifications?: NullableJsonNullValueInput | InputJsonValue
    serviceAreas?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductCreateInput = {
    id?: string
    name: string
    description?: string | null
    category?: string | null
    price?: number | null
    unit?: string | null
    minimumOrderQuantity?: number | null
    supplyAbility?: string | null
    specifications?: NullableJsonNullValueInput | InputJsonValue
    images?: NullableJsonNullValueInput | InputJsonValue
    videos?: NullableJsonNullValueInput | InputJsonValue
    keywords?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    company: CompanyCreateNestedOneWithoutProductsInput
  }

  export type ProductUncheckedCreateInput = {
    id?: string
    name: string
    description?: string | null
    category?: string | null
    price?: number | null
    unit?: string | null
    minimumOrderQuantity?: number | null
    supplyAbility?: string | null
    specifications?: NullableJsonNullValueInput | InputJsonValue
    images?: NullableJsonNullValueInput | InputJsonValue
    videos?: NullableJsonNullValueInput | InputJsonValue
    keywords?: NullableJsonNullValueInput | InputJsonValue
    companyId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProductUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    price?: NullableFloatFieldUpdateOperationsInput | number | null
    unit?: NullableStringFieldUpdateOperationsInput | string | null
    minimumOrderQuantity?: NullableIntFieldUpdateOperationsInput | number | null
    supplyAbility?: NullableStringFieldUpdateOperationsInput | string | null
    specifications?: NullableJsonNullValueInput | InputJsonValue
    images?: NullableJsonNullValueInput | InputJsonValue
    videos?: NullableJsonNullValueInput | InputJsonValue
    keywords?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    company?: CompanyUpdateOneRequiredWithoutProductsNestedInput
  }

  export type ProductUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    price?: NullableFloatFieldUpdateOperationsInput | number | null
    unit?: NullableStringFieldUpdateOperationsInput | string | null
    minimumOrderQuantity?: NullableIntFieldUpdateOperationsInput | number | null
    supplyAbility?: NullableStringFieldUpdateOperationsInput | string | null
    specifications?: NullableJsonNullValueInput | InputJsonValue
    images?: NullableJsonNullValueInput | InputJsonValue
    videos?: NullableJsonNullValueInput | InputJsonValue
    keywords?: NullableJsonNullValueInput | InputJsonValue
    companyId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductCreateManyInput = {
    id?: string
    name: string
    description?: string | null
    category?: string | null
    price?: number | null
    unit?: string | null
    minimumOrderQuantity?: number | null
    supplyAbility?: string | null
    specifications?: NullableJsonNullValueInput | InputJsonValue
    images?: NullableJsonNullValueInput | InputJsonValue
    videos?: NullableJsonNullValueInput | InputJsonValue
    keywords?: NullableJsonNullValueInput | InputJsonValue
    companyId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProductUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    price?: NullableFloatFieldUpdateOperationsInput | number | null
    unit?: NullableStringFieldUpdateOperationsInput | string | null
    minimumOrderQuantity?: NullableIntFieldUpdateOperationsInput | number | null
    supplyAbility?: NullableStringFieldUpdateOperationsInput | string | null
    specifications?: NullableJsonNullValueInput | InputJsonValue
    images?: NullableJsonNullValueInput | InputJsonValue
    videos?: NullableJsonNullValueInput | InputJsonValue
    keywords?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    price?: NullableFloatFieldUpdateOperationsInput | number | null
    unit?: NullableStringFieldUpdateOperationsInput | string | null
    minimumOrderQuantity?: NullableIntFieldUpdateOperationsInput | number | null
    supplyAbility?: NullableStringFieldUpdateOperationsInput | string | null
    specifications?: NullableJsonNullValueInput | InputJsonValue
    images?: NullableJsonNullValueInput | InputJsonValue
    videos?: NullableJsonNullValueInput | InputJsonValue
    keywords?: NullableJsonNullValueInput | InputJsonValue
    companyId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RFQCreateInput = {
    id?: string
    title: string
    description: string
    category: string
    quantity: number
    unit: string
    deadline: Date | string
    status?: $Enums.RFQStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    minBudget?: number | null
    maxBudget?: number | null
    preferredDeliveryDate?: Date | string | null
    deliveryLocation?: string | null
    requirementsDocument?: string | null
    qualificationCriteria?: RFQCreatequalificationCriteriaInput | string[]
    tags?: RFQCreatetagsInput | string[]
    visibility?: $Enums.Visibility
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: UserCreateNestedOneWithoutCreatedRfqsInput
    invitedSuppliers?: UserCreateNestedManyWithoutInvitedToRfqsInput
    bids?: BidCreateNestedManyWithoutRfqInput
  }

  export type RFQUncheckedCreateInput = {
    id?: string
    title: string
    description: string
    category: string
    quantity: number
    unit: string
    deadline: Date | string
    status?: $Enums.RFQStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    minBudget?: number | null
    maxBudget?: number | null
    preferredDeliveryDate?: Date | string | null
    deliveryLocation?: string | null
    requirementsDocument?: string | null
    qualificationCriteria?: RFQCreatequalificationCriteriaInput | string[]
    tags?: RFQCreatetagsInput | string[]
    visibility?: $Enums.Visibility
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    invitedSuppliers?: UserUncheckedCreateNestedManyWithoutInvitedToRfqsInput
    bids?: BidUncheckedCreateNestedManyWithoutRfqInput
  }

  export type RFQUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    quantity?: FloatFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumRFQStatusFieldUpdateOperationsInput | $Enums.RFQStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    minBudget?: NullableFloatFieldUpdateOperationsInput | number | null
    maxBudget?: NullableFloatFieldUpdateOperationsInput | number | null
    preferredDeliveryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveryLocation?: NullableStringFieldUpdateOperationsInput | string | null
    requirementsDocument?: NullableStringFieldUpdateOperationsInput | string | null
    qualificationCriteria?: RFQUpdatequalificationCriteriaInput | string[]
    tags?: RFQUpdatetagsInput | string[]
    visibility?: EnumVisibilityFieldUpdateOperationsInput | $Enums.Visibility
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: UserUpdateOneRequiredWithoutCreatedRfqsNestedInput
    invitedSuppliers?: UserUpdateManyWithoutInvitedToRfqsNestedInput
    bids?: BidUpdateManyWithoutRfqNestedInput
  }

  export type RFQUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    quantity?: FloatFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumRFQStatusFieldUpdateOperationsInput | $Enums.RFQStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    minBudget?: NullableFloatFieldUpdateOperationsInput | number | null
    maxBudget?: NullableFloatFieldUpdateOperationsInput | number | null
    preferredDeliveryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveryLocation?: NullableStringFieldUpdateOperationsInput | string | null
    requirementsDocument?: NullableStringFieldUpdateOperationsInput | string | null
    qualificationCriteria?: RFQUpdatequalificationCriteriaInput | string[]
    tags?: RFQUpdatetagsInput | string[]
    visibility?: EnumVisibilityFieldUpdateOperationsInput | $Enums.Visibility
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    invitedSuppliers?: UserUncheckedUpdateManyWithoutInvitedToRfqsNestedInput
    bids?: BidUncheckedUpdateManyWithoutRfqNestedInput
  }

  export type RFQCreateManyInput = {
    id?: string
    title: string
    description: string
    category: string
    quantity: number
    unit: string
    deadline: Date | string
    status?: $Enums.RFQStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    minBudget?: number | null
    maxBudget?: number | null
    preferredDeliveryDate?: Date | string | null
    deliveryLocation?: string | null
    requirementsDocument?: string | null
    qualificationCriteria?: RFQCreatequalificationCriteriaInput | string[]
    tags?: RFQCreatetagsInput | string[]
    visibility?: $Enums.Visibility
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
  }

  export type RFQUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    quantity?: FloatFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumRFQStatusFieldUpdateOperationsInput | $Enums.RFQStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    minBudget?: NullableFloatFieldUpdateOperationsInput | number | null
    maxBudget?: NullableFloatFieldUpdateOperationsInput | number | null
    preferredDeliveryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveryLocation?: NullableStringFieldUpdateOperationsInput | string | null
    requirementsDocument?: NullableStringFieldUpdateOperationsInput | string | null
    qualificationCriteria?: RFQUpdatequalificationCriteriaInput | string[]
    tags?: RFQUpdatetagsInput | string[]
    visibility?: EnumVisibilityFieldUpdateOperationsInput | $Enums.Visibility
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RFQUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    quantity?: FloatFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumRFQStatusFieldUpdateOperationsInput | $Enums.RFQStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    minBudget?: NullableFloatFieldUpdateOperationsInput | number | null
    maxBudget?: NullableFloatFieldUpdateOperationsInput | number | null
    preferredDeliveryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveryLocation?: NullableStringFieldUpdateOperationsInput | string | null
    requirementsDocument?: NullableStringFieldUpdateOperationsInput | string | null
    qualificationCriteria?: RFQUpdatequalificationCriteriaInput | string[]
    tags?: RFQUpdatetagsInput | string[]
    visibility?: EnumVisibilityFieldUpdateOperationsInput | $Enums.Visibility
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type BidCreateInput = {
    id?: string
    price: number
    quantity: number
    deliveryTime: string
    notes?: string | null
    status?: $Enums.BidStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    technicalSpecifications?: string | null
    termsAndConditions?: string | null
    validity: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    alternativeOffers?: NullableJsonNullValueInput | InputJsonValue
    rfq: RFQCreateNestedOneWithoutBidsInput
    supplier: UserCreateNestedOneWithoutBidsInput
  }

  export type BidUncheckedCreateInput = {
    id?: string
    price: number
    quantity: number
    deliveryTime: string
    notes?: string | null
    status?: $Enums.BidStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    technicalSpecifications?: string | null
    termsAndConditions?: string | null
    validity: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    rfqId: string
    supplierId: string
    alternativeOffers?: NullableJsonNullValueInput | InputJsonValue
  }

  export type BidUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    quantity?: FloatFieldUpdateOperationsInput | number
    deliveryTime?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumBidStatusFieldUpdateOperationsInput | $Enums.BidStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    technicalSpecifications?: NullableStringFieldUpdateOperationsInput | string | null
    termsAndConditions?: NullableStringFieldUpdateOperationsInput | string | null
    validity?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    alternativeOffers?: NullableJsonNullValueInput | InputJsonValue
    rfq?: RFQUpdateOneRequiredWithoutBidsNestedInput
    supplier?: UserUpdateOneRequiredWithoutBidsNestedInput
  }

  export type BidUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    quantity?: FloatFieldUpdateOperationsInput | number
    deliveryTime?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumBidStatusFieldUpdateOperationsInput | $Enums.BidStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    technicalSpecifications?: NullableStringFieldUpdateOperationsInput | string | null
    termsAndConditions?: NullableStringFieldUpdateOperationsInput | string | null
    validity?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rfqId?: StringFieldUpdateOperationsInput | string
    supplierId?: StringFieldUpdateOperationsInput | string
    alternativeOffers?: NullableJsonNullValueInput | InputJsonValue
  }

  export type BidCreateManyInput = {
    id?: string
    price: number
    quantity: number
    deliveryTime: string
    notes?: string | null
    status?: $Enums.BidStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    technicalSpecifications?: string | null
    termsAndConditions?: string | null
    validity: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    rfqId: string
    supplierId: string
    alternativeOffers?: NullableJsonNullValueInput | InputJsonValue
  }

  export type BidUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    quantity?: FloatFieldUpdateOperationsInput | number
    deliveryTime?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumBidStatusFieldUpdateOperationsInput | $Enums.BidStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    technicalSpecifications?: NullableStringFieldUpdateOperationsInput | string | null
    termsAndConditions?: NullableStringFieldUpdateOperationsInput | string | null
    validity?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    alternativeOffers?: NullableJsonNullValueInput | InputJsonValue
  }

  export type BidUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    quantity?: FloatFieldUpdateOperationsInput | number
    deliveryTime?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumBidStatusFieldUpdateOperationsInput | $Enums.BidStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    technicalSpecifications?: NullableStringFieldUpdateOperationsInput | string | null
    termsAndConditions?: NullableStringFieldUpdateOperationsInput | string | null
    validity?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rfqId?: StringFieldUpdateOperationsInput | string
    supplierId?: StringFieldUpdateOperationsInput | string
    alternativeOffers?: NullableJsonNullValueInput | InputJsonValue
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type CompanyScalarRelationFilter = {
    is?: CompanyWhereInput
    isNot?: CompanyWhereInput
  }

  export type RFQListRelationFilter = {
    every?: RFQWhereInput
    some?: RFQWhereInput
    none?: RFQWhereInput
  }

  export type BidListRelationFilter = {
    every?: BidWhereInput
    some?: BidWhereInput
    none?: BidWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type RFQOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type BidOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    role?: SortOrder
    isEmailVerified?: SortOrder
    verificationToken?: SortOrder
    resetPasswordToken?: SortOrder
    resetPasswordExpires?: SortOrder
    lastLoginAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    companyId?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    role?: SortOrder
    isEmailVerified?: SortOrder
    verificationToken?: SortOrder
    resetPasswordToken?: SortOrder
    resetPasswordExpires?: SortOrder
    lastLoginAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    companyId?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    role?: SortOrder
    isEmailVerified?: SortOrder
    verificationToken?: SortOrder
    resetPasswordToken?: SortOrder
    resetPasswordExpires?: SortOrder
    lastLoginAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    companyId?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type UserListRelationFilter = {
    every?: UserWhereInput
    some?: UserWhereInput
    none?: UserWhereInput
  }

  export type ProductListRelationFilter = {
    every?: ProductWhereInput
    some?: ProductWhereInput
    none?: ProductWhereInput
  }

  export type UserOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProductOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CompanyCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    industry?: SortOrder
    website?: SortOrder
    address?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    logoUrl?: SortOrder
    isVerified?: SortOrder
    averageRating?: SortOrder
    registrationNumber?: SortOrder
    taxId?: SortOrder
    foundedYear?: SortOrder
    employeeCount?: SortOrder
    annualRevenue?: SortOrder
    certifications?: SortOrder
    serviceAreas?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CompanyAvgOrderByAggregateInput = {
    averageRating?: SortOrder
    foundedYear?: SortOrder
    employeeCount?: SortOrder
    annualRevenue?: SortOrder
  }

  export type CompanyMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    industry?: SortOrder
    website?: SortOrder
    address?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    logoUrl?: SortOrder
    isVerified?: SortOrder
    averageRating?: SortOrder
    registrationNumber?: SortOrder
    taxId?: SortOrder
    foundedYear?: SortOrder
    employeeCount?: SortOrder
    annualRevenue?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CompanyMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    industry?: SortOrder
    website?: SortOrder
    address?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    logoUrl?: SortOrder
    isVerified?: SortOrder
    averageRating?: SortOrder
    registrationNumber?: SortOrder
    taxId?: SortOrder
    foundedYear?: SortOrder
    employeeCount?: SortOrder
    annualRevenue?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CompanySumOrderByAggregateInput = {
    averageRating?: SortOrder
    foundedYear?: SortOrder
    employeeCount?: SortOrder
    annualRevenue?: SortOrder
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type ProductCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    category?: SortOrder
    price?: SortOrder
    unit?: SortOrder
    minimumOrderQuantity?: SortOrder
    supplyAbility?: SortOrder
    specifications?: SortOrder
    images?: SortOrder
    videos?: SortOrder
    keywords?: SortOrder
    companyId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductAvgOrderByAggregateInput = {
    price?: SortOrder
    minimumOrderQuantity?: SortOrder
  }

  export type ProductMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    category?: SortOrder
    price?: SortOrder
    unit?: SortOrder
    minimumOrderQuantity?: SortOrder
    supplyAbility?: SortOrder
    companyId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    category?: SortOrder
    price?: SortOrder
    unit?: SortOrder
    minimumOrderQuantity?: SortOrder
    supplyAbility?: SortOrder
    companyId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductSumOrderByAggregateInput = {
    price?: SortOrder
    minimumOrderQuantity?: SortOrder
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type EnumRFQStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.RFQStatus | EnumRFQStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RFQStatus[] | ListEnumRFQStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RFQStatus[] | ListEnumRFQStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRFQStatusFilter<$PrismaModel> | $Enums.RFQStatus
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type EnumVisibilityFilter<$PrismaModel = never> = {
    equals?: $Enums.Visibility | EnumVisibilityFieldRefInput<$PrismaModel>
    in?: $Enums.Visibility[] | ListEnumVisibilityFieldRefInput<$PrismaModel>
    notIn?: $Enums.Visibility[] | ListEnumVisibilityFieldRefInput<$PrismaModel>
    not?: NestedEnumVisibilityFilter<$PrismaModel> | $Enums.Visibility
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type RFQCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    category?: SortOrder
    quantity?: SortOrder
    unit?: SortOrder
    deadline?: SortOrder
    status?: SortOrder
    attachments?: SortOrder
    minBudget?: SortOrder
    maxBudget?: SortOrder
    preferredDeliveryDate?: SortOrder
    deliveryLocation?: SortOrder
    requirementsDocument?: SortOrder
    qualificationCriteria?: SortOrder
    tags?: SortOrder
    visibility?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type RFQAvgOrderByAggregateInput = {
    quantity?: SortOrder
    minBudget?: SortOrder
    maxBudget?: SortOrder
  }

  export type RFQMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    category?: SortOrder
    quantity?: SortOrder
    unit?: SortOrder
    deadline?: SortOrder
    status?: SortOrder
    minBudget?: SortOrder
    maxBudget?: SortOrder
    preferredDeliveryDate?: SortOrder
    deliveryLocation?: SortOrder
    requirementsDocument?: SortOrder
    visibility?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type RFQMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    category?: SortOrder
    quantity?: SortOrder
    unit?: SortOrder
    deadline?: SortOrder
    status?: SortOrder
    minBudget?: SortOrder
    maxBudget?: SortOrder
    preferredDeliveryDate?: SortOrder
    deliveryLocation?: SortOrder
    requirementsDocument?: SortOrder
    visibility?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type RFQSumOrderByAggregateInput = {
    quantity?: SortOrder
    minBudget?: SortOrder
    maxBudget?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type EnumRFQStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RFQStatus | EnumRFQStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RFQStatus[] | ListEnumRFQStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RFQStatus[] | ListEnumRFQStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRFQStatusWithAggregatesFilter<$PrismaModel> | $Enums.RFQStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRFQStatusFilter<$PrismaModel>
    _max?: NestedEnumRFQStatusFilter<$PrismaModel>
  }

  export type EnumVisibilityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Visibility | EnumVisibilityFieldRefInput<$PrismaModel>
    in?: $Enums.Visibility[] | ListEnumVisibilityFieldRefInput<$PrismaModel>
    notIn?: $Enums.Visibility[] | ListEnumVisibilityFieldRefInput<$PrismaModel>
    not?: NestedEnumVisibilityWithAggregatesFilter<$PrismaModel> | $Enums.Visibility
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumVisibilityFilter<$PrismaModel>
    _max?: NestedEnumVisibilityFilter<$PrismaModel>
  }

  export type EnumBidStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.BidStatus | EnumBidStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BidStatus[] | ListEnumBidStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BidStatus[] | ListEnumBidStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBidStatusFilter<$PrismaModel> | $Enums.BidStatus
  }

  export type RFQScalarRelationFilter = {
    is?: RFQWhereInput
    isNot?: RFQWhereInput
  }

  export type BidCountOrderByAggregateInput = {
    id?: SortOrder
    price?: SortOrder
    quantity?: SortOrder
    deliveryTime?: SortOrder
    notes?: SortOrder
    status?: SortOrder
    attachments?: SortOrder
    technicalSpecifications?: SortOrder
    termsAndConditions?: SortOrder
    validity?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    rfqId?: SortOrder
    supplierId?: SortOrder
    alternativeOffers?: SortOrder
  }

  export type BidAvgOrderByAggregateInput = {
    price?: SortOrder
    quantity?: SortOrder
  }

  export type BidMaxOrderByAggregateInput = {
    id?: SortOrder
    price?: SortOrder
    quantity?: SortOrder
    deliveryTime?: SortOrder
    notes?: SortOrder
    status?: SortOrder
    technicalSpecifications?: SortOrder
    termsAndConditions?: SortOrder
    validity?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    rfqId?: SortOrder
    supplierId?: SortOrder
  }

  export type BidMinOrderByAggregateInput = {
    id?: SortOrder
    price?: SortOrder
    quantity?: SortOrder
    deliveryTime?: SortOrder
    notes?: SortOrder
    status?: SortOrder
    technicalSpecifications?: SortOrder
    termsAndConditions?: SortOrder
    validity?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    rfqId?: SortOrder
    supplierId?: SortOrder
  }

  export type BidSumOrderByAggregateInput = {
    price?: SortOrder
    quantity?: SortOrder
  }

  export type EnumBidStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BidStatus | EnumBidStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BidStatus[] | ListEnumBidStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BidStatus[] | ListEnumBidStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBidStatusWithAggregatesFilter<$PrismaModel> | $Enums.BidStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBidStatusFilter<$PrismaModel>
    _max?: NestedEnumBidStatusFilter<$PrismaModel>
  }

  export type CompanyCreateNestedOneWithoutUsersInput = {
    create?: XOR<CompanyCreateWithoutUsersInput, CompanyUncheckedCreateWithoutUsersInput>
    connectOrCreate?: CompanyCreateOrConnectWithoutUsersInput
    connect?: CompanyWhereUniqueInput
  }

  export type RFQCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<RFQCreateWithoutCreatedByInput, RFQUncheckedCreateWithoutCreatedByInput> | RFQCreateWithoutCreatedByInput[] | RFQUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: RFQCreateOrConnectWithoutCreatedByInput | RFQCreateOrConnectWithoutCreatedByInput[]
    createMany?: RFQCreateManyCreatedByInputEnvelope
    connect?: RFQWhereUniqueInput | RFQWhereUniqueInput[]
  }

  export type BidCreateNestedManyWithoutSupplierInput = {
    create?: XOR<BidCreateWithoutSupplierInput, BidUncheckedCreateWithoutSupplierInput> | BidCreateWithoutSupplierInput[] | BidUncheckedCreateWithoutSupplierInput[]
    connectOrCreate?: BidCreateOrConnectWithoutSupplierInput | BidCreateOrConnectWithoutSupplierInput[]
    createMany?: BidCreateManySupplierInputEnvelope
    connect?: BidWhereUniqueInput | BidWhereUniqueInput[]
  }

  export type RFQCreateNestedManyWithoutInvitedSuppliersInput = {
    create?: XOR<RFQCreateWithoutInvitedSuppliersInput, RFQUncheckedCreateWithoutInvitedSuppliersInput> | RFQCreateWithoutInvitedSuppliersInput[] | RFQUncheckedCreateWithoutInvitedSuppliersInput[]
    connectOrCreate?: RFQCreateOrConnectWithoutInvitedSuppliersInput | RFQCreateOrConnectWithoutInvitedSuppliersInput[]
    connect?: RFQWhereUniqueInput | RFQWhereUniqueInput[]
  }

  export type RFQUncheckedCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<RFQCreateWithoutCreatedByInput, RFQUncheckedCreateWithoutCreatedByInput> | RFQCreateWithoutCreatedByInput[] | RFQUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: RFQCreateOrConnectWithoutCreatedByInput | RFQCreateOrConnectWithoutCreatedByInput[]
    createMany?: RFQCreateManyCreatedByInputEnvelope
    connect?: RFQWhereUniqueInput | RFQWhereUniqueInput[]
  }

  export type BidUncheckedCreateNestedManyWithoutSupplierInput = {
    create?: XOR<BidCreateWithoutSupplierInput, BidUncheckedCreateWithoutSupplierInput> | BidCreateWithoutSupplierInput[] | BidUncheckedCreateWithoutSupplierInput[]
    connectOrCreate?: BidCreateOrConnectWithoutSupplierInput | BidCreateOrConnectWithoutSupplierInput[]
    createMany?: BidCreateManySupplierInputEnvelope
    connect?: BidWhereUniqueInput | BidWhereUniqueInput[]
  }

  export type RFQUncheckedCreateNestedManyWithoutInvitedSuppliersInput = {
    create?: XOR<RFQCreateWithoutInvitedSuppliersInput, RFQUncheckedCreateWithoutInvitedSuppliersInput> | RFQCreateWithoutInvitedSuppliersInput[] | RFQUncheckedCreateWithoutInvitedSuppliersInput[]
    connectOrCreate?: RFQCreateOrConnectWithoutInvitedSuppliersInput | RFQCreateOrConnectWithoutInvitedSuppliersInput[]
    connect?: RFQWhereUniqueInput | RFQWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumRoleFieldUpdateOperationsInput = {
    set?: $Enums.Role
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type CompanyUpdateOneRequiredWithoutUsersNestedInput = {
    create?: XOR<CompanyCreateWithoutUsersInput, CompanyUncheckedCreateWithoutUsersInput>
    connectOrCreate?: CompanyCreateOrConnectWithoutUsersInput
    upsert?: CompanyUpsertWithoutUsersInput
    connect?: CompanyWhereUniqueInput
    update?: XOR<XOR<CompanyUpdateToOneWithWhereWithoutUsersInput, CompanyUpdateWithoutUsersInput>, CompanyUncheckedUpdateWithoutUsersInput>
  }

  export type RFQUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<RFQCreateWithoutCreatedByInput, RFQUncheckedCreateWithoutCreatedByInput> | RFQCreateWithoutCreatedByInput[] | RFQUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: RFQCreateOrConnectWithoutCreatedByInput | RFQCreateOrConnectWithoutCreatedByInput[]
    upsert?: RFQUpsertWithWhereUniqueWithoutCreatedByInput | RFQUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: RFQCreateManyCreatedByInputEnvelope
    set?: RFQWhereUniqueInput | RFQWhereUniqueInput[]
    disconnect?: RFQWhereUniqueInput | RFQWhereUniqueInput[]
    delete?: RFQWhereUniqueInput | RFQWhereUniqueInput[]
    connect?: RFQWhereUniqueInput | RFQWhereUniqueInput[]
    update?: RFQUpdateWithWhereUniqueWithoutCreatedByInput | RFQUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: RFQUpdateManyWithWhereWithoutCreatedByInput | RFQUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: RFQScalarWhereInput | RFQScalarWhereInput[]
  }

  export type BidUpdateManyWithoutSupplierNestedInput = {
    create?: XOR<BidCreateWithoutSupplierInput, BidUncheckedCreateWithoutSupplierInput> | BidCreateWithoutSupplierInput[] | BidUncheckedCreateWithoutSupplierInput[]
    connectOrCreate?: BidCreateOrConnectWithoutSupplierInput | BidCreateOrConnectWithoutSupplierInput[]
    upsert?: BidUpsertWithWhereUniqueWithoutSupplierInput | BidUpsertWithWhereUniqueWithoutSupplierInput[]
    createMany?: BidCreateManySupplierInputEnvelope
    set?: BidWhereUniqueInput | BidWhereUniqueInput[]
    disconnect?: BidWhereUniqueInput | BidWhereUniqueInput[]
    delete?: BidWhereUniqueInput | BidWhereUniqueInput[]
    connect?: BidWhereUniqueInput | BidWhereUniqueInput[]
    update?: BidUpdateWithWhereUniqueWithoutSupplierInput | BidUpdateWithWhereUniqueWithoutSupplierInput[]
    updateMany?: BidUpdateManyWithWhereWithoutSupplierInput | BidUpdateManyWithWhereWithoutSupplierInput[]
    deleteMany?: BidScalarWhereInput | BidScalarWhereInput[]
  }

  export type RFQUpdateManyWithoutInvitedSuppliersNestedInput = {
    create?: XOR<RFQCreateWithoutInvitedSuppliersInput, RFQUncheckedCreateWithoutInvitedSuppliersInput> | RFQCreateWithoutInvitedSuppliersInput[] | RFQUncheckedCreateWithoutInvitedSuppliersInput[]
    connectOrCreate?: RFQCreateOrConnectWithoutInvitedSuppliersInput | RFQCreateOrConnectWithoutInvitedSuppliersInput[]
    upsert?: RFQUpsertWithWhereUniqueWithoutInvitedSuppliersInput | RFQUpsertWithWhereUniqueWithoutInvitedSuppliersInput[]
    set?: RFQWhereUniqueInput | RFQWhereUniqueInput[]
    disconnect?: RFQWhereUniqueInput | RFQWhereUniqueInput[]
    delete?: RFQWhereUniqueInput | RFQWhereUniqueInput[]
    connect?: RFQWhereUniqueInput | RFQWhereUniqueInput[]
    update?: RFQUpdateWithWhereUniqueWithoutInvitedSuppliersInput | RFQUpdateWithWhereUniqueWithoutInvitedSuppliersInput[]
    updateMany?: RFQUpdateManyWithWhereWithoutInvitedSuppliersInput | RFQUpdateManyWithWhereWithoutInvitedSuppliersInput[]
    deleteMany?: RFQScalarWhereInput | RFQScalarWhereInput[]
  }

  export type RFQUncheckedUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<RFQCreateWithoutCreatedByInput, RFQUncheckedCreateWithoutCreatedByInput> | RFQCreateWithoutCreatedByInput[] | RFQUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: RFQCreateOrConnectWithoutCreatedByInput | RFQCreateOrConnectWithoutCreatedByInput[]
    upsert?: RFQUpsertWithWhereUniqueWithoutCreatedByInput | RFQUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: RFQCreateManyCreatedByInputEnvelope
    set?: RFQWhereUniqueInput | RFQWhereUniqueInput[]
    disconnect?: RFQWhereUniqueInput | RFQWhereUniqueInput[]
    delete?: RFQWhereUniqueInput | RFQWhereUniqueInput[]
    connect?: RFQWhereUniqueInput | RFQWhereUniqueInput[]
    update?: RFQUpdateWithWhereUniqueWithoutCreatedByInput | RFQUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: RFQUpdateManyWithWhereWithoutCreatedByInput | RFQUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: RFQScalarWhereInput | RFQScalarWhereInput[]
  }

  export type BidUncheckedUpdateManyWithoutSupplierNestedInput = {
    create?: XOR<BidCreateWithoutSupplierInput, BidUncheckedCreateWithoutSupplierInput> | BidCreateWithoutSupplierInput[] | BidUncheckedCreateWithoutSupplierInput[]
    connectOrCreate?: BidCreateOrConnectWithoutSupplierInput | BidCreateOrConnectWithoutSupplierInput[]
    upsert?: BidUpsertWithWhereUniqueWithoutSupplierInput | BidUpsertWithWhereUniqueWithoutSupplierInput[]
    createMany?: BidCreateManySupplierInputEnvelope
    set?: BidWhereUniqueInput | BidWhereUniqueInput[]
    disconnect?: BidWhereUniqueInput | BidWhereUniqueInput[]
    delete?: BidWhereUniqueInput | BidWhereUniqueInput[]
    connect?: BidWhereUniqueInput | BidWhereUniqueInput[]
    update?: BidUpdateWithWhereUniqueWithoutSupplierInput | BidUpdateWithWhereUniqueWithoutSupplierInput[]
    updateMany?: BidUpdateManyWithWhereWithoutSupplierInput | BidUpdateManyWithWhereWithoutSupplierInput[]
    deleteMany?: BidScalarWhereInput | BidScalarWhereInput[]
  }

  export type RFQUncheckedUpdateManyWithoutInvitedSuppliersNestedInput = {
    create?: XOR<RFQCreateWithoutInvitedSuppliersInput, RFQUncheckedCreateWithoutInvitedSuppliersInput> | RFQCreateWithoutInvitedSuppliersInput[] | RFQUncheckedCreateWithoutInvitedSuppliersInput[]
    connectOrCreate?: RFQCreateOrConnectWithoutInvitedSuppliersInput | RFQCreateOrConnectWithoutInvitedSuppliersInput[]
    upsert?: RFQUpsertWithWhereUniqueWithoutInvitedSuppliersInput | RFQUpsertWithWhereUniqueWithoutInvitedSuppliersInput[]
    set?: RFQWhereUniqueInput | RFQWhereUniqueInput[]
    disconnect?: RFQWhereUniqueInput | RFQWhereUniqueInput[]
    delete?: RFQWhereUniqueInput | RFQWhereUniqueInput[]
    connect?: RFQWhereUniqueInput | RFQWhereUniqueInput[]
    update?: RFQUpdateWithWhereUniqueWithoutInvitedSuppliersInput | RFQUpdateWithWhereUniqueWithoutInvitedSuppliersInput[]
    updateMany?: RFQUpdateManyWithWhereWithoutInvitedSuppliersInput | RFQUpdateManyWithWhereWithoutInvitedSuppliersInput[]
    deleteMany?: RFQScalarWhereInput | RFQScalarWhereInput[]
  }

  export type UserCreateNestedManyWithoutCompanyInput = {
    create?: XOR<UserCreateWithoutCompanyInput, UserUncheckedCreateWithoutCompanyInput> | UserCreateWithoutCompanyInput[] | UserUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: UserCreateOrConnectWithoutCompanyInput | UserCreateOrConnectWithoutCompanyInput[]
    createMany?: UserCreateManyCompanyInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type ProductCreateNestedManyWithoutCompanyInput = {
    create?: XOR<ProductCreateWithoutCompanyInput, ProductUncheckedCreateWithoutCompanyInput> | ProductCreateWithoutCompanyInput[] | ProductUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutCompanyInput | ProductCreateOrConnectWithoutCompanyInput[]
    createMany?: ProductCreateManyCompanyInputEnvelope
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutCompanyInput = {
    create?: XOR<UserCreateWithoutCompanyInput, UserUncheckedCreateWithoutCompanyInput> | UserCreateWithoutCompanyInput[] | UserUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: UserCreateOrConnectWithoutCompanyInput | UserCreateOrConnectWithoutCompanyInput[]
    createMany?: UserCreateManyCompanyInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type ProductUncheckedCreateNestedManyWithoutCompanyInput = {
    create?: XOR<ProductCreateWithoutCompanyInput, ProductUncheckedCreateWithoutCompanyInput> | ProductCreateWithoutCompanyInput[] | ProductUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutCompanyInput | ProductCreateOrConnectWithoutCompanyInput[]
    createMany?: ProductCreateManyCompanyInputEnvelope
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserUpdateManyWithoutCompanyNestedInput = {
    create?: XOR<UserCreateWithoutCompanyInput, UserUncheckedCreateWithoutCompanyInput> | UserCreateWithoutCompanyInput[] | UserUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: UserCreateOrConnectWithoutCompanyInput | UserCreateOrConnectWithoutCompanyInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutCompanyInput | UserUpsertWithWhereUniqueWithoutCompanyInput[]
    createMany?: UserCreateManyCompanyInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutCompanyInput | UserUpdateWithWhereUniqueWithoutCompanyInput[]
    updateMany?: UserUpdateManyWithWhereWithoutCompanyInput | UserUpdateManyWithWhereWithoutCompanyInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type ProductUpdateManyWithoutCompanyNestedInput = {
    create?: XOR<ProductCreateWithoutCompanyInput, ProductUncheckedCreateWithoutCompanyInput> | ProductCreateWithoutCompanyInput[] | ProductUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutCompanyInput | ProductCreateOrConnectWithoutCompanyInput[]
    upsert?: ProductUpsertWithWhereUniqueWithoutCompanyInput | ProductUpsertWithWhereUniqueWithoutCompanyInput[]
    createMany?: ProductCreateManyCompanyInputEnvelope
    set?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    disconnect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    delete?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    update?: ProductUpdateWithWhereUniqueWithoutCompanyInput | ProductUpdateWithWhereUniqueWithoutCompanyInput[]
    updateMany?: ProductUpdateManyWithWhereWithoutCompanyInput | ProductUpdateManyWithWhereWithoutCompanyInput[]
    deleteMany?: ProductScalarWhereInput | ProductScalarWhereInput[]
  }

  export type UserUncheckedUpdateManyWithoutCompanyNestedInput = {
    create?: XOR<UserCreateWithoutCompanyInput, UserUncheckedCreateWithoutCompanyInput> | UserCreateWithoutCompanyInput[] | UserUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: UserCreateOrConnectWithoutCompanyInput | UserCreateOrConnectWithoutCompanyInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutCompanyInput | UserUpsertWithWhereUniqueWithoutCompanyInput[]
    createMany?: UserCreateManyCompanyInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutCompanyInput | UserUpdateWithWhereUniqueWithoutCompanyInput[]
    updateMany?: UserUpdateManyWithWhereWithoutCompanyInput | UserUpdateManyWithWhereWithoutCompanyInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type ProductUncheckedUpdateManyWithoutCompanyNestedInput = {
    create?: XOR<ProductCreateWithoutCompanyInput, ProductUncheckedCreateWithoutCompanyInput> | ProductCreateWithoutCompanyInput[] | ProductUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutCompanyInput | ProductCreateOrConnectWithoutCompanyInput[]
    upsert?: ProductUpsertWithWhereUniqueWithoutCompanyInput | ProductUpsertWithWhereUniqueWithoutCompanyInput[]
    createMany?: ProductCreateManyCompanyInputEnvelope
    set?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    disconnect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    delete?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    update?: ProductUpdateWithWhereUniqueWithoutCompanyInput | ProductUpdateWithWhereUniqueWithoutCompanyInput[]
    updateMany?: ProductUpdateManyWithWhereWithoutCompanyInput | ProductUpdateManyWithWhereWithoutCompanyInput[]
    deleteMany?: ProductScalarWhereInput | ProductScalarWhereInput[]
  }

  export type CompanyCreateNestedOneWithoutProductsInput = {
    create?: XOR<CompanyCreateWithoutProductsInput, CompanyUncheckedCreateWithoutProductsInput>
    connectOrCreate?: CompanyCreateOrConnectWithoutProductsInput
    connect?: CompanyWhereUniqueInput
  }

  export type CompanyUpdateOneRequiredWithoutProductsNestedInput = {
    create?: XOR<CompanyCreateWithoutProductsInput, CompanyUncheckedCreateWithoutProductsInput>
    connectOrCreate?: CompanyCreateOrConnectWithoutProductsInput
    upsert?: CompanyUpsertWithoutProductsInput
    connect?: CompanyWhereUniqueInput
    update?: XOR<XOR<CompanyUpdateToOneWithWhereWithoutProductsInput, CompanyUpdateWithoutProductsInput>, CompanyUncheckedUpdateWithoutProductsInput>
  }

  export type RFQCreatequalificationCriteriaInput = {
    set: string[]
  }

  export type RFQCreatetagsInput = {
    set: string[]
  }

  export type UserCreateNestedOneWithoutCreatedRfqsInput = {
    create?: XOR<UserCreateWithoutCreatedRfqsInput, UserUncheckedCreateWithoutCreatedRfqsInput>
    connectOrCreate?: UserCreateOrConnectWithoutCreatedRfqsInput
    connect?: UserWhereUniqueInput
  }

  export type UserCreateNestedManyWithoutInvitedToRfqsInput = {
    create?: XOR<UserCreateWithoutInvitedToRfqsInput, UserUncheckedCreateWithoutInvitedToRfqsInput> | UserCreateWithoutInvitedToRfqsInput[] | UserUncheckedCreateWithoutInvitedToRfqsInput[]
    connectOrCreate?: UserCreateOrConnectWithoutInvitedToRfqsInput | UserCreateOrConnectWithoutInvitedToRfqsInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type BidCreateNestedManyWithoutRfqInput = {
    create?: XOR<BidCreateWithoutRfqInput, BidUncheckedCreateWithoutRfqInput> | BidCreateWithoutRfqInput[] | BidUncheckedCreateWithoutRfqInput[]
    connectOrCreate?: BidCreateOrConnectWithoutRfqInput | BidCreateOrConnectWithoutRfqInput[]
    createMany?: BidCreateManyRfqInputEnvelope
    connect?: BidWhereUniqueInput | BidWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutInvitedToRfqsInput = {
    create?: XOR<UserCreateWithoutInvitedToRfqsInput, UserUncheckedCreateWithoutInvitedToRfqsInput> | UserCreateWithoutInvitedToRfqsInput[] | UserUncheckedCreateWithoutInvitedToRfqsInput[]
    connectOrCreate?: UserCreateOrConnectWithoutInvitedToRfqsInput | UserCreateOrConnectWithoutInvitedToRfqsInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type BidUncheckedCreateNestedManyWithoutRfqInput = {
    create?: XOR<BidCreateWithoutRfqInput, BidUncheckedCreateWithoutRfqInput> | BidCreateWithoutRfqInput[] | BidUncheckedCreateWithoutRfqInput[]
    connectOrCreate?: BidCreateOrConnectWithoutRfqInput | BidCreateOrConnectWithoutRfqInput[]
    createMany?: BidCreateManyRfqInputEnvelope
    connect?: BidWhereUniqueInput | BidWhereUniqueInput[]
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumRFQStatusFieldUpdateOperationsInput = {
    set?: $Enums.RFQStatus
  }

  export type RFQUpdatequalificationCriteriaInput = {
    set?: string[]
    push?: string | string[]
  }

  export type RFQUpdatetagsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type EnumVisibilityFieldUpdateOperationsInput = {
    set?: $Enums.Visibility
  }

  export type UserUpdateOneRequiredWithoutCreatedRfqsNestedInput = {
    create?: XOR<UserCreateWithoutCreatedRfqsInput, UserUncheckedCreateWithoutCreatedRfqsInput>
    connectOrCreate?: UserCreateOrConnectWithoutCreatedRfqsInput
    upsert?: UserUpsertWithoutCreatedRfqsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutCreatedRfqsInput, UserUpdateWithoutCreatedRfqsInput>, UserUncheckedUpdateWithoutCreatedRfqsInput>
  }

  export type UserUpdateManyWithoutInvitedToRfqsNestedInput = {
    create?: XOR<UserCreateWithoutInvitedToRfqsInput, UserUncheckedCreateWithoutInvitedToRfqsInput> | UserCreateWithoutInvitedToRfqsInput[] | UserUncheckedCreateWithoutInvitedToRfqsInput[]
    connectOrCreate?: UserCreateOrConnectWithoutInvitedToRfqsInput | UserCreateOrConnectWithoutInvitedToRfqsInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutInvitedToRfqsInput | UserUpsertWithWhereUniqueWithoutInvitedToRfqsInput[]
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutInvitedToRfqsInput | UserUpdateWithWhereUniqueWithoutInvitedToRfqsInput[]
    updateMany?: UserUpdateManyWithWhereWithoutInvitedToRfqsInput | UserUpdateManyWithWhereWithoutInvitedToRfqsInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type BidUpdateManyWithoutRfqNestedInput = {
    create?: XOR<BidCreateWithoutRfqInput, BidUncheckedCreateWithoutRfqInput> | BidCreateWithoutRfqInput[] | BidUncheckedCreateWithoutRfqInput[]
    connectOrCreate?: BidCreateOrConnectWithoutRfqInput | BidCreateOrConnectWithoutRfqInput[]
    upsert?: BidUpsertWithWhereUniqueWithoutRfqInput | BidUpsertWithWhereUniqueWithoutRfqInput[]
    createMany?: BidCreateManyRfqInputEnvelope
    set?: BidWhereUniqueInput | BidWhereUniqueInput[]
    disconnect?: BidWhereUniqueInput | BidWhereUniqueInput[]
    delete?: BidWhereUniqueInput | BidWhereUniqueInput[]
    connect?: BidWhereUniqueInput | BidWhereUniqueInput[]
    update?: BidUpdateWithWhereUniqueWithoutRfqInput | BidUpdateWithWhereUniqueWithoutRfqInput[]
    updateMany?: BidUpdateManyWithWhereWithoutRfqInput | BidUpdateManyWithWhereWithoutRfqInput[]
    deleteMany?: BidScalarWhereInput | BidScalarWhereInput[]
  }

  export type UserUncheckedUpdateManyWithoutInvitedToRfqsNestedInput = {
    create?: XOR<UserCreateWithoutInvitedToRfqsInput, UserUncheckedCreateWithoutInvitedToRfqsInput> | UserCreateWithoutInvitedToRfqsInput[] | UserUncheckedCreateWithoutInvitedToRfqsInput[]
    connectOrCreate?: UserCreateOrConnectWithoutInvitedToRfqsInput | UserCreateOrConnectWithoutInvitedToRfqsInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutInvitedToRfqsInput | UserUpsertWithWhereUniqueWithoutInvitedToRfqsInput[]
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutInvitedToRfqsInput | UserUpdateWithWhereUniqueWithoutInvitedToRfqsInput[]
    updateMany?: UserUpdateManyWithWhereWithoutInvitedToRfqsInput | UserUpdateManyWithWhereWithoutInvitedToRfqsInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type BidUncheckedUpdateManyWithoutRfqNestedInput = {
    create?: XOR<BidCreateWithoutRfqInput, BidUncheckedCreateWithoutRfqInput> | BidCreateWithoutRfqInput[] | BidUncheckedCreateWithoutRfqInput[]
    connectOrCreate?: BidCreateOrConnectWithoutRfqInput | BidCreateOrConnectWithoutRfqInput[]
    upsert?: BidUpsertWithWhereUniqueWithoutRfqInput | BidUpsertWithWhereUniqueWithoutRfqInput[]
    createMany?: BidCreateManyRfqInputEnvelope
    set?: BidWhereUniqueInput | BidWhereUniqueInput[]
    disconnect?: BidWhereUniqueInput | BidWhereUniqueInput[]
    delete?: BidWhereUniqueInput | BidWhereUniqueInput[]
    connect?: BidWhereUniqueInput | BidWhereUniqueInput[]
    update?: BidUpdateWithWhereUniqueWithoutRfqInput | BidUpdateWithWhereUniqueWithoutRfqInput[]
    updateMany?: BidUpdateManyWithWhereWithoutRfqInput | BidUpdateManyWithWhereWithoutRfqInput[]
    deleteMany?: BidScalarWhereInput | BidScalarWhereInput[]
  }

  export type RFQCreateNestedOneWithoutBidsInput = {
    create?: XOR<RFQCreateWithoutBidsInput, RFQUncheckedCreateWithoutBidsInput>
    connectOrCreate?: RFQCreateOrConnectWithoutBidsInput
    connect?: RFQWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutBidsInput = {
    create?: XOR<UserCreateWithoutBidsInput, UserUncheckedCreateWithoutBidsInput>
    connectOrCreate?: UserCreateOrConnectWithoutBidsInput
    connect?: UserWhereUniqueInput
  }

  export type EnumBidStatusFieldUpdateOperationsInput = {
    set?: $Enums.BidStatus
  }

  export type RFQUpdateOneRequiredWithoutBidsNestedInput = {
    create?: XOR<RFQCreateWithoutBidsInput, RFQUncheckedCreateWithoutBidsInput>
    connectOrCreate?: RFQCreateOrConnectWithoutBidsInput
    upsert?: RFQUpsertWithoutBidsInput
    connect?: RFQWhereUniqueInput
    update?: XOR<XOR<RFQUpdateToOneWithWhereWithoutBidsInput, RFQUpdateWithoutBidsInput>, RFQUncheckedUpdateWithoutBidsInput>
  }

  export type UserUpdateOneRequiredWithoutBidsNestedInput = {
    create?: XOR<UserCreateWithoutBidsInput, UserUncheckedCreateWithoutBidsInput>
    connectOrCreate?: UserCreateOrConnectWithoutBidsInput
    upsert?: UserUpsertWithoutBidsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutBidsInput, UserUpdateWithoutBidsInput>, UserUncheckedUpdateWithoutBidsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedEnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumRFQStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.RFQStatus | EnumRFQStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RFQStatus[] | ListEnumRFQStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RFQStatus[] | ListEnumRFQStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRFQStatusFilter<$PrismaModel> | $Enums.RFQStatus
  }

  export type NestedEnumVisibilityFilter<$PrismaModel = never> = {
    equals?: $Enums.Visibility | EnumVisibilityFieldRefInput<$PrismaModel>
    in?: $Enums.Visibility[] | ListEnumVisibilityFieldRefInput<$PrismaModel>
    notIn?: $Enums.Visibility[] | ListEnumVisibilityFieldRefInput<$PrismaModel>
    not?: NestedEnumVisibilityFilter<$PrismaModel> | $Enums.Visibility
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedEnumRFQStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RFQStatus | EnumRFQStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RFQStatus[] | ListEnumRFQStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RFQStatus[] | ListEnumRFQStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRFQStatusWithAggregatesFilter<$PrismaModel> | $Enums.RFQStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRFQStatusFilter<$PrismaModel>
    _max?: NestedEnumRFQStatusFilter<$PrismaModel>
  }

  export type NestedEnumVisibilityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Visibility | EnumVisibilityFieldRefInput<$PrismaModel>
    in?: $Enums.Visibility[] | ListEnumVisibilityFieldRefInput<$PrismaModel>
    notIn?: $Enums.Visibility[] | ListEnumVisibilityFieldRefInput<$PrismaModel>
    not?: NestedEnumVisibilityWithAggregatesFilter<$PrismaModel> | $Enums.Visibility
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumVisibilityFilter<$PrismaModel>
    _max?: NestedEnumVisibilityFilter<$PrismaModel>
  }

  export type NestedEnumBidStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.BidStatus | EnumBidStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BidStatus[] | ListEnumBidStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BidStatus[] | ListEnumBidStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBidStatusFilter<$PrismaModel> | $Enums.BidStatus
  }

  export type NestedEnumBidStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BidStatus | EnumBidStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BidStatus[] | ListEnumBidStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BidStatus[] | ListEnumBidStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBidStatusWithAggregatesFilter<$PrismaModel> | $Enums.BidStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBidStatusFilter<$PrismaModel>
    _max?: NestedEnumBidStatusFilter<$PrismaModel>
  }

  export type CompanyCreateWithoutUsersInput = {
    id?: string
    name: string
    description?: string | null
    industry?: string | null
    website?: string | null
    address?: string | null
    phone?: string | null
    email?: string | null
    logoUrl?: string | null
    isVerified?: boolean
    averageRating?: number | null
    registrationNumber?: string | null
    taxId?: string | null
    foundedYear?: number | null
    employeeCount?: number | null
    annualRevenue?: number | null
    certifications?: NullableJsonNullValueInput | InputJsonValue
    serviceAreas?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: ProductCreateNestedManyWithoutCompanyInput
  }

  export type CompanyUncheckedCreateWithoutUsersInput = {
    id?: string
    name: string
    description?: string | null
    industry?: string | null
    website?: string | null
    address?: string | null
    phone?: string | null
    email?: string | null
    logoUrl?: string | null
    isVerified?: boolean
    averageRating?: number | null
    registrationNumber?: string | null
    taxId?: string | null
    foundedYear?: number | null
    employeeCount?: number | null
    annualRevenue?: number | null
    certifications?: NullableJsonNullValueInput | InputJsonValue
    serviceAreas?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: ProductUncheckedCreateNestedManyWithoutCompanyInput
  }

  export type CompanyCreateOrConnectWithoutUsersInput = {
    where: CompanyWhereUniqueInput
    create: XOR<CompanyCreateWithoutUsersInput, CompanyUncheckedCreateWithoutUsersInput>
  }

  export type RFQCreateWithoutCreatedByInput = {
    id?: string
    title: string
    description: string
    category: string
    quantity: number
    unit: string
    deadline: Date | string
    status?: $Enums.RFQStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    minBudget?: number | null
    maxBudget?: number | null
    preferredDeliveryDate?: Date | string | null
    deliveryLocation?: string | null
    requirementsDocument?: string | null
    qualificationCriteria?: RFQCreatequalificationCriteriaInput | string[]
    tags?: RFQCreatetagsInput | string[]
    visibility?: $Enums.Visibility
    createdAt?: Date | string
    updatedAt?: Date | string
    invitedSuppliers?: UserCreateNestedManyWithoutInvitedToRfqsInput
    bids?: BidCreateNestedManyWithoutRfqInput
  }

  export type RFQUncheckedCreateWithoutCreatedByInput = {
    id?: string
    title: string
    description: string
    category: string
    quantity: number
    unit: string
    deadline: Date | string
    status?: $Enums.RFQStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    minBudget?: number | null
    maxBudget?: number | null
    preferredDeliveryDate?: Date | string | null
    deliveryLocation?: string | null
    requirementsDocument?: string | null
    qualificationCriteria?: RFQCreatequalificationCriteriaInput | string[]
    tags?: RFQCreatetagsInput | string[]
    visibility?: $Enums.Visibility
    createdAt?: Date | string
    updatedAt?: Date | string
    invitedSuppliers?: UserUncheckedCreateNestedManyWithoutInvitedToRfqsInput
    bids?: BidUncheckedCreateNestedManyWithoutRfqInput
  }

  export type RFQCreateOrConnectWithoutCreatedByInput = {
    where: RFQWhereUniqueInput
    create: XOR<RFQCreateWithoutCreatedByInput, RFQUncheckedCreateWithoutCreatedByInput>
  }

  export type RFQCreateManyCreatedByInputEnvelope = {
    data: RFQCreateManyCreatedByInput | RFQCreateManyCreatedByInput[]
    skipDuplicates?: boolean
  }

  export type BidCreateWithoutSupplierInput = {
    id?: string
    price: number
    quantity: number
    deliveryTime: string
    notes?: string | null
    status?: $Enums.BidStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    technicalSpecifications?: string | null
    termsAndConditions?: string | null
    validity: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    alternativeOffers?: NullableJsonNullValueInput | InputJsonValue
    rfq: RFQCreateNestedOneWithoutBidsInput
  }

  export type BidUncheckedCreateWithoutSupplierInput = {
    id?: string
    price: number
    quantity: number
    deliveryTime: string
    notes?: string | null
    status?: $Enums.BidStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    technicalSpecifications?: string | null
    termsAndConditions?: string | null
    validity: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    rfqId: string
    alternativeOffers?: NullableJsonNullValueInput | InputJsonValue
  }

  export type BidCreateOrConnectWithoutSupplierInput = {
    where: BidWhereUniqueInput
    create: XOR<BidCreateWithoutSupplierInput, BidUncheckedCreateWithoutSupplierInput>
  }

  export type BidCreateManySupplierInputEnvelope = {
    data: BidCreateManySupplierInput | BidCreateManySupplierInput[]
    skipDuplicates?: boolean
  }

  export type RFQCreateWithoutInvitedSuppliersInput = {
    id?: string
    title: string
    description: string
    category: string
    quantity: number
    unit: string
    deadline: Date | string
    status?: $Enums.RFQStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    minBudget?: number | null
    maxBudget?: number | null
    preferredDeliveryDate?: Date | string | null
    deliveryLocation?: string | null
    requirementsDocument?: string | null
    qualificationCriteria?: RFQCreatequalificationCriteriaInput | string[]
    tags?: RFQCreatetagsInput | string[]
    visibility?: $Enums.Visibility
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: UserCreateNestedOneWithoutCreatedRfqsInput
    bids?: BidCreateNestedManyWithoutRfqInput
  }

  export type RFQUncheckedCreateWithoutInvitedSuppliersInput = {
    id?: string
    title: string
    description: string
    category: string
    quantity: number
    unit: string
    deadline: Date | string
    status?: $Enums.RFQStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    minBudget?: number | null
    maxBudget?: number | null
    preferredDeliveryDate?: Date | string | null
    deliveryLocation?: string | null
    requirementsDocument?: string | null
    qualificationCriteria?: RFQCreatequalificationCriteriaInput | string[]
    tags?: RFQCreatetagsInput | string[]
    visibility?: $Enums.Visibility
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    bids?: BidUncheckedCreateNestedManyWithoutRfqInput
  }

  export type RFQCreateOrConnectWithoutInvitedSuppliersInput = {
    where: RFQWhereUniqueInput
    create: XOR<RFQCreateWithoutInvitedSuppliersInput, RFQUncheckedCreateWithoutInvitedSuppliersInput>
  }

  export type CompanyUpsertWithoutUsersInput = {
    update: XOR<CompanyUpdateWithoutUsersInput, CompanyUncheckedUpdateWithoutUsersInput>
    create: XOR<CompanyCreateWithoutUsersInput, CompanyUncheckedCreateWithoutUsersInput>
    where?: CompanyWhereInput
  }

  export type CompanyUpdateToOneWithWhereWithoutUsersInput = {
    where?: CompanyWhereInput
    data: XOR<CompanyUpdateWithoutUsersInput, CompanyUncheckedUpdateWithoutUsersInput>
  }

  export type CompanyUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    industry?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    averageRating?: NullableFloatFieldUpdateOperationsInput | number | null
    registrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    taxId?: NullableStringFieldUpdateOperationsInput | string | null
    foundedYear?: NullableIntFieldUpdateOperationsInput | number | null
    employeeCount?: NullableIntFieldUpdateOperationsInput | number | null
    annualRevenue?: NullableFloatFieldUpdateOperationsInput | number | null
    certifications?: NullableJsonNullValueInput | InputJsonValue
    serviceAreas?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: ProductUpdateManyWithoutCompanyNestedInput
  }

  export type CompanyUncheckedUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    industry?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    averageRating?: NullableFloatFieldUpdateOperationsInput | number | null
    registrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    taxId?: NullableStringFieldUpdateOperationsInput | string | null
    foundedYear?: NullableIntFieldUpdateOperationsInput | number | null
    employeeCount?: NullableIntFieldUpdateOperationsInput | number | null
    annualRevenue?: NullableFloatFieldUpdateOperationsInput | number | null
    certifications?: NullableJsonNullValueInput | InputJsonValue
    serviceAreas?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: ProductUncheckedUpdateManyWithoutCompanyNestedInput
  }

  export type RFQUpsertWithWhereUniqueWithoutCreatedByInput = {
    where: RFQWhereUniqueInput
    update: XOR<RFQUpdateWithoutCreatedByInput, RFQUncheckedUpdateWithoutCreatedByInput>
    create: XOR<RFQCreateWithoutCreatedByInput, RFQUncheckedCreateWithoutCreatedByInput>
  }

  export type RFQUpdateWithWhereUniqueWithoutCreatedByInput = {
    where: RFQWhereUniqueInput
    data: XOR<RFQUpdateWithoutCreatedByInput, RFQUncheckedUpdateWithoutCreatedByInput>
  }

  export type RFQUpdateManyWithWhereWithoutCreatedByInput = {
    where: RFQScalarWhereInput
    data: XOR<RFQUpdateManyMutationInput, RFQUncheckedUpdateManyWithoutCreatedByInput>
  }

  export type RFQScalarWhereInput = {
    AND?: RFQScalarWhereInput | RFQScalarWhereInput[]
    OR?: RFQScalarWhereInput[]
    NOT?: RFQScalarWhereInput | RFQScalarWhereInput[]
    id?: StringFilter<"RFQ"> | string
    title?: StringFilter<"RFQ"> | string
    description?: StringFilter<"RFQ"> | string
    category?: StringFilter<"RFQ"> | string
    quantity?: FloatFilter<"RFQ"> | number
    unit?: StringFilter<"RFQ"> | string
    deadline?: DateTimeFilter<"RFQ"> | Date | string
    status?: EnumRFQStatusFilter<"RFQ"> | $Enums.RFQStatus
    attachments?: JsonNullableFilter<"RFQ">
    minBudget?: FloatNullableFilter<"RFQ"> | number | null
    maxBudget?: FloatNullableFilter<"RFQ"> | number | null
    preferredDeliveryDate?: DateTimeNullableFilter<"RFQ"> | Date | string | null
    deliveryLocation?: StringNullableFilter<"RFQ"> | string | null
    requirementsDocument?: StringNullableFilter<"RFQ"> | string | null
    qualificationCriteria?: StringNullableListFilter<"RFQ">
    tags?: StringNullableListFilter<"RFQ">
    visibility?: EnumVisibilityFilter<"RFQ"> | $Enums.Visibility
    createdAt?: DateTimeFilter<"RFQ"> | Date | string
    updatedAt?: DateTimeFilter<"RFQ"> | Date | string
    userId?: StringFilter<"RFQ"> | string
  }

  export type BidUpsertWithWhereUniqueWithoutSupplierInput = {
    where: BidWhereUniqueInput
    update: XOR<BidUpdateWithoutSupplierInput, BidUncheckedUpdateWithoutSupplierInput>
    create: XOR<BidCreateWithoutSupplierInput, BidUncheckedCreateWithoutSupplierInput>
  }

  export type BidUpdateWithWhereUniqueWithoutSupplierInput = {
    where: BidWhereUniqueInput
    data: XOR<BidUpdateWithoutSupplierInput, BidUncheckedUpdateWithoutSupplierInput>
  }

  export type BidUpdateManyWithWhereWithoutSupplierInput = {
    where: BidScalarWhereInput
    data: XOR<BidUpdateManyMutationInput, BidUncheckedUpdateManyWithoutSupplierInput>
  }

  export type BidScalarWhereInput = {
    AND?: BidScalarWhereInput | BidScalarWhereInput[]
    OR?: BidScalarWhereInput[]
    NOT?: BidScalarWhereInput | BidScalarWhereInput[]
    id?: StringFilter<"Bid"> | string
    price?: FloatFilter<"Bid"> | number
    quantity?: FloatFilter<"Bid"> | number
    deliveryTime?: StringFilter<"Bid"> | string
    notes?: StringNullableFilter<"Bid"> | string | null
    status?: EnumBidStatusFilter<"Bid"> | $Enums.BidStatus
    attachments?: JsonNullableFilter<"Bid">
    technicalSpecifications?: StringNullableFilter<"Bid"> | string | null
    termsAndConditions?: StringNullableFilter<"Bid"> | string | null
    validity?: DateTimeFilter<"Bid"> | Date | string
    createdAt?: DateTimeFilter<"Bid"> | Date | string
    updatedAt?: DateTimeFilter<"Bid"> | Date | string
    rfqId?: StringFilter<"Bid"> | string
    supplierId?: StringFilter<"Bid"> | string
    alternativeOffers?: JsonNullableFilter<"Bid">
  }

  export type RFQUpsertWithWhereUniqueWithoutInvitedSuppliersInput = {
    where: RFQWhereUniqueInput
    update: XOR<RFQUpdateWithoutInvitedSuppliersInput, RFQUncheckedUpdateWithoutInvitedSuppliersInput>
    create: XOR<RFQCreateWithoutInvitedSuppliersInput, RFQUncheckedCreateWithoutInvitedSuppliersInput>
  }

  export type RFQUpdateWithWhereUniqueWithoutInvitedSuppliersInput = {
    where: RFQWhereUniqueInput
    data: XOR<RFQUpdateWithoutInvitedSuppliersInput, RFQUncheckedUpdateWithoutInvitedSuppliersInput>
  }

  export type RFQUpdateManyWithWhereWithoutInvitedSuppliersInput = {
    where: RFQScalarWhereInput
    data: XOR<RFQUpdateManyMutationInput, RFQUncheckedUpdateManyWithoutInvitedSuppliersInput>
  }

  export type UserCreateWithoutCompanyInput = {
    id?: string
    email: string
    name: string
    password: string
    role?: $Enums.Role
    isEmailVerified?: boolean
    verificationToken?: string | null
    resetPasswordToken?: string | null
    resetPasswordExpires?: Date | string | null
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdRfqs?: RFQCreateNestedManyWithoutCreatedByInput
    bids?: BidCreateNestedManyWithoutSupplierInput
    invitedToRfqs?: RFQCreateNestedManyWithoutInvitedSuppliersInput
  }

  export type UserUncheckedCreateWithoutCompanyInput = {
    id?: string
    email: string
    name: string
    password: string
    role?: $Enums.Role
    isEmailVerified?: boolean
    verificationToken?: string | null
    resetPasswordToken?: string | null
    resetPasswordExpires?: Date | string | null
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdRfqs?: RFQUncheckedCreateNestedManyWithoutCreatedByInput
    bids?: BidUncheckedCreateNestedManyWithoutSupplierInput
    invitedToRfqs?: RFQUncheckedCreateNestedManyWithoutInvitedSuppliersInput
  }

  export type UserCreateOrConnectWithoutCompanyInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCompanyInput, UserUncheckedCreateWithoutCompanyInput>
  }

  export type UserCreateManyCompanyInputEnvelope = {
    data: UserCreateManyCompanyInput | UserCreateManyCompanyInput[]
    skipDuplicates?: boolean
  }

  export type ProductCreateWithoutCompanyInput = {
    id?: string
    name: string
    description?: string | null
    category?: string | null
    price?: number | null
    unit?: string | null
    minimumOrderQuantity?: number | null
    supplyAbility?: string | null
    specifications?: NullableJsonNullValueInput | InputJsonValue
    images?: NullableJsonNullValueInput | InputJsonValue
    videos?: NullableJsonNullValueInput | InputJsonValue
    keywords?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProductUncheckedCreateWithoutCompanyInput = {
    id?: string
    name: string
    description?: string | null
    category?: string | null
    price?: number | null
    unit?: string | null
    minimumOrderQuantity?: number | null
    supplyAbility?: string | null
    specifications?: NullableJsonNullValueInput | InputJsonValue
    images?: NullableJsonNullValueInput | InputJsonValue
    videos?: NullableJsonNullValueInput | InputJsonValue
    keywords?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProductCreateOrConnectWithoutCompanyInput = {
    where: ProductWhereUniqueInput
    create: XOR<ProductCreateWithoutCompanyInput, ProductUncheckedCreateWithoutCompanyInput>
  }

  export type ProductCreateManyCompanyInputEnvelope = {
    data: ProductCreateManyCompanyInput | ProductCreateManyCompanyInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithWhereUniqueWithoutCompanyInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutCompanyInput, UserUncheckedUpdateWithoutCompanyInput>
    create: XOR<UserCreateWithoutCompanyInput, UserUncheckedCreateWithoutCompanyInput>
  }

  export type UserUpdateWithWhereUniqueWithoutCompanyInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutCompanyInput, UserUncheckedUpdateWithoutCompanyInput>
  }

  export type UserUpdateManyWithWhereWithoutCompanyInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutCompanyInput>
  }

  export type UserScalarWhereInput = {
    AND?: UserScalarWhereInput | UserScalarWhereInput[]
    OR?: UserScalarWhereInput[]
    NOT?: UserScalarWhereInput | UserScalarWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    isEmailVerified?: BoolFilter<"User"> | boolean
    verificationToken?: StringNullableFilter<"User"> | string | null
    resetPasswordToken?: StringNullableFilter<"User"> | string | null
    resetPasswordExpires?: DateTimeNullableFilter<"User"> | Date | string | null
    lastLoginAt?: DateTimeNullableFilter<"User"> | Date | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    companyId?: StringFilter<"User"> | string
  }

  export type ProductUpsertWithWhereUniqueWithoutCompanyInput = {
    where: ProductWhereUniqueInput
    update: XOR<ProductUpdateWithoutCompanyInput, ProductUncheckedUpdateWithoutCompanyInput>
    create: XOR<ProductCreateWithoutCompanyInput, ProductUncheckedCreateWithoutCompanyInput>
  }

  export type ProductUpdateWithWhereUniqueWithoutCompanyInput = {
    where: ProductWhereUniqueInput
    data: XOR<ProductUpdateWithoutCompanyInput, ProductUncheckedUpdateWithoutCompanyInput>
  }

  export type ProductUpdateManyWithWhereWithoutCompanyInput = {
    where: ProductScalarWhereInput
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyWithoutCompanyInput>
  }

  export type ProductScalarWhereInput = {
    AND?: ProductScalarWhereInput | ProductScalarWhereInput[]
    OR?: ProductScalarWhereInput[]
    NOT?: ProductScalarWhereInput | ProductScalarWhereInput[]
    id?: StringFilter<"Product"> | string
    name?: StringFilter<"Product"> | string
    description?: StringNullableFilter<"Product"> | string | null
    category?: StringNullableFilter<"Product"> | string | null
    price?: FloatNullableFilter<"Product"> | number | null
    unit?: StringNullableFilter<"Product"> | string | null
    minimumOrderQuantity?: IntNullableFilter<"Product"> | number | null
    supplyAbility?: StringNullableFilter<"Product"> | string | null
    specifications?: JsonNullableFilter<"Product">
    images?: JsonNullableFilter<"Product">
    videos?: JsonNullableFilter<"Product">
    keywords?: JsonNullableFilter<"Product">
    companyId?: StringFilter<"Product"> | string
    createdAt?: DateTimeFilter<"Product"> | Date | string
    updatedAt?: DateTimeFilter<"Product"> | Date | string
  }

  export type CompanyCreateWithoutProductsInput = {
    id?: string
    name: string
    description?: string | null
    industry?: string | null
    website?: string | null
    address?: string | null
    phone?: string | null
    email?: string | null
    logoUrl?: string | null
    isVerified?: boolean
    averageRating?: number | null
    registrationNumber?: string | null
    taxId?: string | null
    foundedYear?: number | null
    employeeCount?: number | null
    annualRevenue?: number | null
    certifications?: NullableJsonNullValueInput | InputJsonValue
    serviceAreas?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserCreateNestedManyWithoutCompanyInput
  }

  export type CompanyUncheckedCreateWithoutProductsInput = {
    id?: string
    name: string
    description?: string | null
    industry?: string | null
    website?: string | null
    address?: string | null
    phone?: string | null
    email?: string | null
    logoUrl?: string | null
    isVerified?: boolean
    averageRating?: number | null
    registrationNumber?: string | null
    taxId?: string | null
    foundedYear?: number | null
    employeeCount?: number | null
    annualRevenue?: number | null
    certifications?: NullableJsonNullValueInput | InputJsonValue
    serviceAreas?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutCompanyInput
  }

  export type CompanyCreateOrConnectWithoutProductsInput = {
    where: CompanyWhereUniqueInput
    create: XOR<CompanyCreateWithoutProductsInput, CompanyUncheckedCreateWithoutProductsInput>
  }

  export type CompanyUpsertWithoutProductsInput = {
    update: XOR<CompanyUpdateWithoutProductsInput, CompanyUncheckedUpdateWithoutProductsInput>
    create: XOR<CompanyCreateWithoutProductsInput, CompanyUncheckedCreateWithoutProductsInput>
    where?: CompanyWhereInput
  }

  export type CompanyUpdateToOneWithWhereWithoutProductsInput = {
    where?: CompanyWhereInput
    data: XOR<CompanyUpdateWithoutProductsInput, CompanyUncheckedUpdateWithoutProductsInput>
  }

  export type CompanyUpdateWithoutProductsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    industry?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    averageRating?: NullableFloatFieldUpdateOperationsInput | number | null
    registrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    taxId?: NullableStringFieldUpdateOperationsInput | string | null
    foundedYear?: NullableIntFieldUpdateOperationsInput | number | null
    employeeCount?: NullableIntFieldUpdateOperationsInput | number | null
    annualRevenue?: NullableFloatFieldUpdateOperationsInput | number | null
    certifications?: NullableJsonNullValueInput | InputJsonValue
    serviceAreas?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutCompanyNestedInput
  }

  export type CompanyUncheckedUpdateWithoutProductsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    industry?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    averageRating?: NullableFloatFieldUpdateOperationsInput | number | null
    registrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    taxId?: NullableStringFieldUpdateOperationsInput | string | null
    foundedYear?: NullableIntFieldUpdateOperationsInput | number | null
    employeeCount?: NullableIntFieldUpdateOperationsInput | number | null
    annualRevenue?: NullableFloatFieldUpdateOperationsInput | number | null
    certifications?: NullableJsonNullValueInput | InputJsonValue
    serviceAreas?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutCompanyNestedInput
  }

  export type UserCreateWithoutCreatedRfqsInput = {
    id?: string
    email: string
    name: string
    password: string
    role?: $Enums.Role
    isEmailVerified?: boolean
    verificationToken?: string | null
    resetPasswordToken?: string | null
    resetPasswordExpires?: Date | string | null
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    company: CompanyCreateNestedOneWithoutUsersInput
    bids?: BidCreateNestedManyWithoutSupplierInput
    invitedToRfqs?: RFQCreateNestedManyWithoutInvitedSuppliersInput
  }

  export type UserUncheckedCreateWithoutCreatedRfqsInput = {
    id?: string
    email: string
    name: string
    password: string
    role?: $Enums.Role
    isEmailVerified?: boolean
    verificationToken?: string | null
    resetPasswordToken?: string | null
    resetPasswordExpires?: Date | string | null
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    companyId: string
    bids?: BidUncheckedCreateNestedManyWithoutSupplierInput
    invitedToRfqs?: RFQUncheckedCreateNestedManyWithoutInvitedSuppliersInput
  }

  export type UserCreateOrConnectWithoutCreatedRfqsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCreatedRfqsInput, UserUncheckedCreateWithoutCreatedRfqsInput>
  }

  export type UserCreateWithoutInvitedToRfqsInput = {
    id?: string
    email: string
    name: string
    password: string
    role?: $Enums.Role
    isEmailVerified?: boolean
    verificationToken?: string | null
    resetPasswordToken?: string | null
    resetPasswordExpires?: Date | string | null
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    company: CompanyCreateNestedOneWithoutUsersInput
    createdRfqs?: RFQCreateNestedManyWithoutCreatedByInput
    bids?: BidCreateNestedManyWithoutSupplierInput
  }

  export type UserUncheckedCreateWithoutInvitedToRfqsInput = {
    id?: string
    email: string
    name: string
    password: string
    role?: $Enums.Role
    isEmailVerified?: boolean
    verificationToken?: string | null
    resetPasswordToken?: string | null
    resetPasswordExpires?: Date | string | null
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    companyId: string
    createdRfqs?: RFQUncheckedCreateNestedManyWithoutCreatedByInput
    bids?: BidUncheckedCreateNestedManyWithoutSupplierInput
  }

  export type UserCreateOrConnectWithoutInvitedToRfqsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutInvitedToRfqsInput, UserUncheckedCreateWithoutInvitedToRfqsInput>
  }

  export type BidCreateWithoutRfqInput = {
    id?: string
    price: number
    quantity: number
    deliveryTime: string
    notes?: string | null
    status?: $Enums.BidStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    technicalSpecifications?: string | null
    termsAndConditions?: string | null
    validity: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    alternativeOffers?: NullableJsonNullValueInput | InputJsonValue
    supplier: UserCreateNestedOneWithoutBidsInput
  }

  export type BidUncheckedCreateWithoutRfqInput = {
    id?: string
    price: number
    quantity: number
    deliveryTime: string
    notes?: string | null
    status?: $Enums.BidStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    technicalSpecifications?: string | null
    termsAndConditions?: string | null
    validity: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    supplierId: string
    alternativeOffers?: NullableJsonNullValueInput | InputJsonValue
  }

  export type BidCreateOrConnectWithoutRfqInput = {
    where: BidWhereUniqueInput
    create: XOR<BidCreateWithoutRfqInput, BidUncheckedCreateWithoutRfqInput>
  }

  export type BidCreateManyRfqInputEnvelope = {
    data: BidCreateManyRfqInput | BidCreateManyRfqInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutCreatedRfqsInput = {
    update: XOR<UserUpdateWithoutCreatedRfqsInput, UserUncheckedUpdateWithoutCreatedRfqsInput>
    create: XOR<UserCreateWithoutCreatedRfqsInput, UserUncheckedCreateWithoutCreatedRfqsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutCreatedRfqsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutCreatedRfqsInput, UserUncheckedUpdateWithoutCreatedRfqsInput>
  }

  export type UserUpdateWithoutCreatedRfqsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isEmailVerified?: BoolFieldUpdateOperationsInput | boolean
    verificationToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordExpires?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    company?: CompanyUpdateOneRequiredWithoutUsersNestedInput
    bids?: BidUpdateManyWithoutSupplierNestedInput
    invitedToRfqs?: RFQUpdateManyWithoutInvitedSuppliersNestedInput
  }

  export type UserUncheckedUpdateWithoutCreatedRfqsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isEmailVerified?: BoolFieldUpdateOperationsInput | boolean
    verificationToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordExpires?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    companyId?: StringFieldUpdateOperationsInput | string
    bids?: BidUncheckedUpdateManyWithoutSupplierNestedInput
    invitedToRfqs?: RFQUncheckedUpdateManyWithoutInvitedSuppliersNestedInput
  }

  export type UserUpsertWithWhereUniqueWithoutInvitedToRfqsInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutInvitedToRfqsInput, UserUncheckedUpdateWithoutInvitedToRfqsInput>
    create: XOR<UserCreateWithoutInvitedToRfqsInput, UserUncheckedCreateWithoutInvitedToRfqsInput>
  }

  export type UserUpdateWithWhereUniqueWithoutInvitedToRfqsInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutInvitedToRfqsInput, UserUncheckedUpdateWithoutInvitedToRfqsInput>
  }

  export type UserUpdateManyWithWhereWithoutInvitedToRfqsInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutInvitedToRfqsInput>
  }

  export type BidUpsertWithWhereUniqueWithoutRfqInput = {
    where: BidWhereUniqueInput
    update: XOR<BidUpdateWithoutRfqInput, BidUncheckedUpdateWithoutRfqInput>
    create: XOR<BidCreateWithoutRfqInput, BidUncheckedCreateWithoutRfqInput>
  }

  export type BidUpdateWithWhereUniqueWithoutRfqInput = {
    where: BidWhereUniqueInput
    data: XOR<BidUpdateWithoutRfqInput, BidUncheckedUpdateWithoutRfqInput>
  }

  export type BidUpdateManyWithWhereWithoutRfqInput = {
    where: BidScalarWhereInput
    data: XOR<BidUpdateManyMutationInput, BidUncheckedUpdateManyWithoutRfqInput>
  }

  export type RFQCreateWithoutBidsInput = {
    id?: string
    title: string
    description: string
    category: string
    quantity: number
    unit: string
    deadline: Date | string
    status?: $Enums.RFQStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    minBudget?: number | null
    maxBudget?: number | null
    preferredDeliveryDate?: Date | string | null
    deliveryLocation?: string | null
    requirementsDocument?: string | null
    qualificationCriteria?: RFQCreatequalificationCriteriaInput | string[]
    tags?: RFQCreatetagsInput | string[]
    visibility?: $Enums.Visibility
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: UserCreateNestedOneWithoutCreatedRfqsInput
    invitedSuppliers?: UserCreateNestedManyWithoutInvitedToRfqsInput
  }

  export type RFQUncheckedCreateWithoutBidsInput = {
    id?: string
    title: string
    description: string
    category: string
    quantity: number
    unit: string
    deadline: Date | string
    status?: $Enums.RFQStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    minBudget?: number | null
    maxBudget?: number | null
    preferredDeliveryDate?: Date | string | null
    deliveryLocation?: string | null
    requirementsDocument?: string | null
    qualificationCriteria?: RFQCreatequalificationCriteriaInput | string[]
    tags?: RFQCreatetagsInput | string[]
    visibility?: $Enums.Visibility
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    invitedSuppliers?: UserUncheckedCreateNestedManyWithoutInvitedToRfqsInput
  }

  export type RFQCreateOrConnectWithoutBidsInput = {
    where: RFQWhereUniqueInput
    create: XOR<RFQCreateWithoutBidsInput, RFQUncheckedCreateWithoutBidsInput>
  }

  export type UserCreateWithoutBidsInput = {
    id?: string
    email: string
    name: string
    password: string
    role?: $Enums.Role
    isEmailVerified?: boolean
    verificationToken?: string | null
    resetPasswordToken?: string | null
    resetPasswordExpires?: Date | string | null
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    company: CompanyCreateNestedOneWithoutUsersInput
    createdRfqs?: RFQCreateNestedManyWithoutCreatedByInput
    invitedToRfqs?: RFQCreateNestedManyWithoutInvitedSuppliersInput
  }

  export type UserUncheckedCreateWithoutBidsInput = {
    id?: string
    email: string
    name: string
    password: string
    role?: $Enums.Role
    isEmailVerified?: boolean
    verificationToken?: string | null
    resetPasswordToken?: string | null
    resetPasswordExpires?: Date | string | null
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    companyId: string
    createdRfqs?: RFQUncheckedCreateNestedManyWithoutCreatedByInput
    invitedToRfqs?: RFQUncheckedCreateNestedManyWithoutInvitedSuppliersInput
  }

  export type UserCreateOrConnectWithoutBidsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutBidsInput, UserUncheckedCreateWithoutBidsInput>
  }

  export type RFQUpsertWithoutBidsInput = {
    update: XOR<RFQUpdateWithoutBidsInput, RFQUncheckedUpdateWithoutBidsInput>
    create: XOR<RFQCreateWithoutBidsInput, RFQUncheckedCreateWithoutBidsInput>
    where?: RFQWhereInput
  }

  export type RFQUpdateToOneWithWhereWithoutBidsInput = {
    where?: RFQWhereInput
    data: XOR<RFQUpdateWithoutBidsInput, RFQUncheckedUpdateWithoutBidsInput>
  }

  export type RFQUpdateWithoutBidsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    quantity?: FloatFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumRFQStatusFieldUpdateOperationsInput | $Enums.RFQStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    minBudget?: NullableFloatFieldUpdateOperationsInput | number | null
    maxBudget?: NullableFloatFieldUpdateOperationsInput | number | null
    preferredDeliveryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveryLocation?: NullableStringFieldUpdateOperationsInput | string | null
    requirementsDocument?: NullableStringFieldUpdateOperationsInput | string | null
    qualificationCriteria?: RFQUpdatequalificationCriteriaInput | string[]
    tags?: RFQUpdatetagsInput | string[]
    visibility?: EnumVisibilityFieldUpdateOperationsInput | $Enums.Visibility
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: UserUpdateOneRequiredWithoutCreatedRfqsNestedInput
    invitedSuppliers?: UserUpdateManyWithoutInvitedToRfqsNestedInput
  }

  export type RFQUncheckedUpdateWithoutBidsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    quantity?: FloatFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumRFQStatusFieldUpdateOperationsInput | $Enums.RFQStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    minBudget?: NullableFloatFieldUpdateOperationsInput | number | null
    maxBudget?: NullableFloatFieldUpdateOperationsInput | number | null
    preferredDeliveryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveryLocation?: NullableStringFieldUpdateOperationsInput | string | null
    requirementsDocument?: NullableStringFieldUpdateOperationsInput | string | null
    qualificationCriteria?: RFQUpdatequalificationCriteriaInput | string[]
    tags?: RFQUpdatetagsInput | string[]
    visibility?: EnumVisibilityFieldUpdateOperationsInput | $Enums.Visibility
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    invitedSuppliers?: UserUncheckedUpdateManyWithoutInvitedToRfqsNestedInput
  }

  export type UserUpsertWithoutBidsInput = {
    update: XOR<UserUpdateWithoutBidsInput, UserUncheckedUpdateWithoutBidsInput>
    create: XOR<UserCreateWithoutBidsInput, UserUncheckedCreateWithoutBidsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutBidsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutBidsInput, UserUncheckedUpdateWithoutBidsInput>
  }

  export type UserUpdateWithoutBidsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isEmailVerified?: BoolFieldUpdateOperationsInput | boolean
    verificationToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordExpires?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    company?: CompanyUpdateOneRequiredWithoutUsersNestedInput
    createdRfqs?: RFQUpdateManyWithoutCreatedByNestedInput
    invitedToRfqs?: RFQUpdateManyWithoutInvitedSuppliersNestedInput
  }

  export type UserUncheckedUpdateWithoutBidsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isEmailVerified?: BoolFieldUpdateOperationsInput | boolean
    verificationToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordExpires?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    companyId?: StringFieldUpdateOperationsInput | string
    createdRfqs?: RFQUncheckedUpdateManyWithoutCreatedByNestedInput
    invitedToRfqs?: RFQUncheckedUpdateManyWithoutInvitedSuppliersNestedInput
  }

  export type RFQCreateManyCreatedByInput = {
    id?: string
    title: string
    description: string
    category: string
    quantity: number
    unit: string
    deadline: Date | string
    status?: $Enums.RFQStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    minBudget?: number | null
    maxBudget?: number | null
    preferredDeliveryDate?: Date | string | null
    deliveryLocation?: string | null
    requirementsDocument?: string | null
    qualificationCriteria?: RFQCreatequalificationCriteriaInput | string[]
    tags?: RFQCreatetagsInput | string[]
    visibility?: $Enums.Visibility
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BidCreateManySupplierInput = {
    id?: string
    price: number
    quantity: number
    deliveryTime: string
    notes?: string | null
    status?: $Enums.BidStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    technicalSpecifications?: string | null
    termsAndConditions?: string | null
    validity: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    rfqId: string
    alternativeOffers?: NullableJsonNullValueInput | InputJsonValue
  }

  export type RFQUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    quantity?: FloatFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumRFQStatusFieldUpdateOperationsInput | $Enums.RFQStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    minBudget?: NullableFloatFieldUpdateOperationsInput | number | null
    maxBudget?: NullableFloatFieldUpdateOperationsInput | number | null
    preferredDeliveryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveryLocation?: NullableStringFieldUpdateOperationsInput | string | null
    requirementsDocument?: NullableStringFieldUpdateOperationsInput | string | null
    qualificationCriteria?: RFQUpdatequalificationCriteriaInput | string[]
    tags?: RFQUpdatetagsInput | string[]
    visibility?: EnumVisibilityFieldUpdateOperationsInput | $Enums.Visibility
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    invitedSuppliers?: UserUpdateManyWithoutInvitedToRfqsNestedInput
    bids?: BidUpdateManyWithoutRfqNestedInput
  }

  export type RFQUncheckedUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    quantity?: FloatFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumRFQStatusFieldUpdateOperationsInput | $Enums.RFQStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    minBudget?: NullableFloatFieldUpdateOperationsInput | number | null
    maxBudget?: NullableFloatFieldUpdateOperationsInput | number | null
    preferredDeliveryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveryLocation?: NullableStringFieldUpdateOperationsInput | string | null
    requirementsDocument?: NullableStringFieldUpdateOperationsInput | string | null
    qualificationCriteria?: RFQUpdatequalificationCriteriaInput | string[]
    tags?: RFQUpdatetagsInput | string[]
    visibility?: EnumVisibilityFieldUpdateOperationsInput | $Enums.Visibility
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    invitedSuppliers?: UserUncheckedUpdateManyWithoutInvitedToRfqsNestedInput
    bids?: BidUncheckedUpdateManyWithoutRfqNestedInput
  }

  export type RFQUncheckedUpdateManyWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    quantity?: FloatFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumRFQStatusFieldUpdateOperationsInput | $Enums.RFQStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    minBudget?: NullableFloatFieldUpdateOperationsInput | number | null
    maxBudget?: NullableFloatFieldUpdateOperationsInput | number | null
    preferredDeliveryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveryLocation?: NullableStringFieldUpdateOperationsInput | string | null
    requirementsDocument?: NullableStringFieldUpdateOperationsInput | string | null
    qualificationCriteria?: RFQUpdatequalificationCriteriaInput | string[]
    tags?: RFQUpdatetagsInput | string[]
    visibility?: EnumVisibilityFieldUpdateOperationsInput | $Enums.Visibility
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BidUpdateWithoutSupplierInput = {
    id?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    quantity?: FloatFieldUpdateOperationsInput | number
    deliveryTime?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumBidStatusFieldUpdateOperationsInput | $Enums.BidStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    technicalSpecifications?: NullableStringFieldUpdateOperationsInput | string | null
    termsAndConditions?: NullableStringFieldUpdateOperationsInput | string | null
    validity?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    alternativeOffers?: NullableJsonNullValueInput | InputJsonValue
    rfq?: RFQUpdateOneRequiredWithoutBidsNestedInput
  }

  export type BidUncheckedUpdateWithoutSupplierInput = {
    id?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    quantity?: FloatFieldUpdateOperationsInput | number
    deliveryTime?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumBidStatusFieldUpdateOperationsInput | $Enums.BidStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    technicalSpecifications?: NullableStringFieldUpdateOperationsInput | string | null
    termsAndConditions?: NullableStringFieldUpdateOperationsInput | string | null
    validity?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rfqId?: StringFieldUpdateOperationsInput | string
    alternativeOffers?: NullableJsonNullValueInput | InputJsonValue
  }

  export type BidUncheckedUpdateManyWithoutSupplierInput = {
    id?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    quantity?: FloatFieldUpdateOperationsInput | number
    deliveryTime?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumBidStatusFieldUpdateOperationsInput | $Enums.BidStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    technicalSpecifications?: NullableStringFieldUpdateOperationsInput | string | null
    termsAndConditions?: NullableStringFieldUpdateOperationsInput | string | null
    validity?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rfqId?: StringFieldUpdateOperationsInput | string
    alternativeOffers?: NullableJsonNullValueInput | InputJsonValue
  }

  export type RFQUpdateWithoutInvitedSuppliersInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    quantity?: FloatFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumRFQStatusFieldUpdateOperationsInput | $Enums.RFQStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    minBudget?: NullableFloatFieldUpdateOperationsInput | number | null
    maxBudget?: NullableFloatFieldUpdateOperationsInput | number | null
    preferredDeliveryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveryLocation?: NullableStringFieldUpdateOperationsInput | string | null
    requirementsDocument?: NullableStringFieldUpdateOperationsInput | string | null
    qualificationCriteria?: RFQUpdatequalificationCriteriaInput | string[]
    tags?: RFQUpdatetagsInput | string[]
    visibility?: EnumVisibilityFieldUpdateOperationsInput | $Enums.Visibility
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: UserUpdateOneRequiredWithoutCreatedRfqsNestedInput
    bids?: BidUpdateManyWithoutRfqNestedInput
  }

  export type RFQUncheckedUpdateWithoutInvitedSuppliersInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    quantity?: FloatFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumRFQStatusFieldUpdateOperationsInput | $Enums.RFQStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    minBudget?: NullableFloatFieldUpdateOperationsInput | number | null
    maxBudget?: NullableFloatFieldUpdateOperationsInput | number | null
    preferredDeliveryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveryLocation?: NullableStringFieldUpdateOperationsInput | string | null
    requirementsDocument?: NullableStringFieldUpdateOperationsInput | string | null
    qualificationCriteria?: RFQUpdatequalificationCriteriaInput | string[]
    tags?: RFQUpdatetagsInput | string[]
    visibility?: EnumVisibilityFieldUpdateOperationsInput | $Enums.Visibility
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    bids?: BidUncheckedUpdateManyWithoutRfqNestedInput
  }

  export type RFQUncheckedUpdateManyWithoutInvitedSuppliersInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    quantity?: FloatFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumRFQStatusFieldUpdateOperationsInput | $Enums.RFQStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    minBudget?: NullableFloatFieldUpdateOperationsInput | number | null
    maxBudget?: NullableFloatFieldUpdateOperationsInput | number | null
    preferredDeliveryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveryLocation?: NullableStringFieldUpdateOperationsInput | string | null
    requirementsDocument?: NullableStringFieldUpdateOperationsInput | string | null
    qualificationCriteria?: RFQUpdatequalificationCriteriaInput | string[]
    tags?: RFQUpdatetagsInput | string[]
    visibility?: EnumVisibilityFieldUpdateOperationsInput | $Enums.Visibility
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type UserCreateManyCompanyInput = {
    id?: string
    email: string
    name: string
    password: string
    role?: $Enums.Role
    isEmailVerified?: boolean
    verificationToken?: string | null
    resetPasswordToken?: string | null
    resetPasswordExpires?: Date | string | null
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProductCreateManyCompanyInput = {
    id?: string
    name: string
    description?: string | null
    category?: string | null
    price?: number | null
    unit?: string | null
    minimumOrderQuantity?: number | null
    supplyAbility?: string | null
    specifications?: NullableJsonNullValueInput | InputJsonValue
    images?: NullableJsonNullValueInput | InputJsonValue
    videos?: NullableJsonNullValueInput | InputJsonValue
    keywords?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateWithoutCompanyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isEmailVerified?: BoolFieldUpdateOperationsInput | boolean
    verificationToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordExpires?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdRfqs?: RFQUpdateManyWithoutCreatedByNestedInput
    bids?: BidUpdateManyWithoutSupplierNestedInput
    invitedToRfqs?: RFQUpdateManyWithoutInvitedSuppliersNestedInput
  }

  export type UserUncheckedUpdateWithoutCompanyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isEmailVerified?: BoolFieldUpdateOperationsInput | boolean
    verificationToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordExpires?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdRfqs?: RFQUncheckedUpdateManyWithoutCreatedByNestedInput
    bids?: BidUncheckedUpdateManyWithoutSupplierNestedInput
    invitedToRfqs?: RFQUncheckedUpdateManyWithoutInvitedSuppliersNestedInput
  }

  export type UserUncheckedUpdateManyWithoutCompanyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isEmailVerified?: BoolFieldUpdateOperationsInput | boolean
    verificationToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordExpires?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductUpdateWithoutCompanyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    price?: NullableFloatFieldUpdateOperationsInput | number | null
    unit?: NullableStringFieldUpdateOperationsInput | string | null
    minimumOrderQuantity?: NullableIntFieldUpdateOperationsInput | number | null
    supplyAbility?: NullableStringFieldUpdateOperationsInput | string | null
    specifications?: NullableJsonNullValueInput | InputJsonValue
    images?: NullableJsonNullValueInput | InputJsonValue
    videos?: NullableJsonNullValueInput | InputJsonValue
    keywords?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductUncheckedUpdateWithoutCompanyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    price?: NullableFloatFieldUpdateOperationsInput | number | null
    unit?: NullableStringFieldUpdateOperationsInput | string | null
    minimumOrderQuantity?: NullableIntFieldUpdateOperationsInput | number | null
    supplyAbility?: NullableStringFieldUpdateOperationsInput | string | null
    specifications?: NullableJsonNullValueInput | InputJsonValue
    images?: NullableJsonNullValueInput | InputJsonValue
    videos?: NullableJsonNullValueInput | InputJsonValue
    keywords?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductUncheckedUpdateManyWithoutCompanyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    price?: NullableFloatFieldUpdateOperationsInput | number | null
    unit?: NullableStringFieldUpdateOperationsInput | string | null
    minimumOrderQuantity?: NullableIntFieldUpdateOperationsInput | number | null
    supplyAbility?: NullableStringFieldUpdateOperationsInput | string | null
    specifications?: NullableJsonNullValueInput | InputJsonValue
    images?: NullableJsonNullValueInput | InputJsonValue
    videos?: NullableJsonNullValueInput | InputJsonValue
    keywords?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BidCreateManyRfqInput = {
    id?: string
    price: number
    quantity: number
    deliveryTime: string
    notes?: string | null
    status?: $Enums.BidStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    technicalSpecifications?: string | null
    termsAndConditions?: string | null
    validity: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    supplierId: string
    alternativeOffers?: NullableJsonNullValueInput | InputJsonValue
  }

  export type UserUpdateWithoutInvitedToRfqsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isEmailVerified?: BoolFieldUpdateOperationsInput | boolean
    verificationToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordExpires?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    company?: CompanyUpdateOneRequiredWithoutUsersNestedInput
    createdRfqs?: RFQUpdateManyWithoutCreatedByNestedInput
    bids?: BidUpdateManyWithoutSupplierNestedInput
  }

  export type UserUncheckedUpdateWithoutInvitedToRfqsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isEmailVerified?: BoolFieldUpdateOperationsInput | boolean
    verificationToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordExpires?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    companyId?: StringFieldUpdateOperationsInput | string
    createdRfqs?: RFQUncheckedUpdateManyWithoutCreatedByNestedInput
    bids?: BidUncheckedUpdateManyWithoutSupplierNestedInput
  }

  export type UserUncheckedUpdateManyWithoutInvitedToRfqsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isEmailVerified?: BoolFieldUpdateOperationsInput | boolean
    verificationToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordExpires?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    companyId?: StringFieldUpdateOperationsInput | string
  }

  export type BidUpdateWithoutRfqInput = {
    id?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    quantity?: FloatFieldUpdateOperationsInput | number
    deliveryTime?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumBidStatusFieldUpdateOperationsInput | $Enums.BidStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    technicalSpecifications?: NullableStringFieldUpdateOperationsInput | string | null
    termsAndConditions?: NullableStringFieldUpdateOperationsInput | string | null
    validity?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    alternativeOffers?: NullableJsonNullValueInput | InputJsonValue
    supplier?: UserUpdateOneRequiredWithoutBidsNestedInput
  }

  export type BidUncheckedUpdateWithoutRfqInput = {
    id?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    quantity?: FloatFieldUpdateOperationsInput | number
    deliveryTime?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumBidStatusFieldUpdateOperationsInput | $Enums.BidStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    technicalSpecifications?: NullableStringFieldUpdateOperationsInput | string | null
    termsAndConditions?: NullableStringFieldUpdateOperationsInput | string | null
    validity?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    supplierId?: StringFieldUpdateOperationsInput | string
    alternativeOffers?: NullableJsonNullValueInput | InputJsonValue
  }

  export type BidUncheckedUpdateManyWithoutRfqInput = {
    id?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    quantity?: FloatFieldUpdateOperationsInput | number
    deliveryTime?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumBidStatusFieldUpdateOperationsInput | $Enums.BidStatus
    attachments?: NullableJsonNullValueInput | InputJsonValue
    technicalSpecifications?: NullableStringFieldUpdateOperationsInput | string | null
    termsAndConditions?: NullableStringFieldUpdateOperationsInput | string | null
    validity?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    supplierId?: StringFieldUpdateOperationsInput | string
    alternativeOffers?: NullableJsonNullValueInput | InputJsonValue
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}