import { type PwrcOperationClass } from "../operations/policy.js";
export interface OperationContext {
    operation: PwrcOperationClass;
    requestId: string;
    amountBaseUnits?: bigint;
}
export declare function assertOperationContext(context: OperationContext): void;
export declare function handleOperation<T>(context: OperationContext, operation: () => Promise<T>): Promise<T>;
//# sourceMappingURL=operation-handler.d.ts.map