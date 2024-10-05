export default ({ frames, url, options, label, framedata_field, props }) => {
    return (
        <div
            onClick={() => {
                const body = JSON.parse(options?.body || "{}");
                if (framedata_field) {
                    body[framedata_field] = frames;
                }
                fetch(url, { ...options, body: JSON.stringify(body) });
            }}
            {...props}
        >
            {label}
        </div>
    );
};
