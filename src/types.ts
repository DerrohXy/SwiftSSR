export type HTMLElementTag = string;

export type ClassValue =
    | string
    | number
    | Record<string, boolean>
    | ClassValue[]
    | null
    | undefined;

export type HTMLElementProps = {
    style?: Record<string, string>;
    className?: ClassValue;
    [key: string]: any;
};
