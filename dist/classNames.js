export default function classNames(...values) {
    return values
        .flatMap((value) => {
        if (typeof value === "string")
            return value;
        if (!value)
            return [];
        return Object.entries(value)
            .filter(([, enabled]) => Boolean(enabled))
            .map(([className]) => className);
    })
        .join(" ");
}
