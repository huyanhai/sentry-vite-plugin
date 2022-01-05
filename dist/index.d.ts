export default function sentry(options: any): {
    name: string;
    closeBundle: () => Promise<void>;
};
