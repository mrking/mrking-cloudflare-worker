export default {
    async email(message, env, ctx) {
        const blockList = ["example.com"];

        // read destination from Cloudflare secret
        const forwardTo = env.FORWARD_TO;

        if (!forwardTo) {
            message.setReject("Relay is misconfigured: FORWARD_TO missing");
            return;
        }

        // basic block-list check
        const fromDomain = message.from.split("@").pop().toLowerCase();
        if (blockList.includes(fromDomain)) {
            message.setReject("Address is blocked");
            return;
        }

        await message.forward(forwardTo);
    },
};
