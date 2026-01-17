export interface RateFormData {
    file: File | null;
    timeDomain: string | null;
    fluidList: Array<string>;
}

export interface PressureFormData {
    file: File | null;
    methodAggregate: string | null;
}

export interface CompletionFormData {
    file: File | null;
}