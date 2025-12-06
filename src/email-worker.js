export default {
    async email(message, env, ctx) {
        try {
            // 1. Read destination from Cloudflare secret
            const forwardTo = env.FORWARD_TO;
            if (!forwardTo) {
                console.log("FORWARD_TO is not set in Worker secrets");
                message.setReject("Relay misconfigured (FORWARD_TO missing)");
                return;
            }

            // 2. Block list logic – robust against weird/empty from:
            const rawFrom = message.from || "";
            const blockedDomains = ["example.com"];

            let fromDomain = rawFrom.toLowerCase();
            if (rawFrom.includes("@")) {
                fromDomain = rawFrom.split("@").pop().toLowerCase();
            }

            if (blockedDomains.includes(fromDomain)) {
                console.log("Blocked email from domain:", fromDomain);
                message.setReject("Address is blocked");
                return;
            }

            // 3. Forward to your iCloud address
            console.log("Forwarding email from", rawFrom, "to", forwardTo);
            await message.forward(forwardTo);

        } catch (err) {
            // Catch *any* runtime error so it doesn’t just explode
            console.error("Email Worker error:", err);
            message.setReject("Temporary error in relay");
        }
    },
};
