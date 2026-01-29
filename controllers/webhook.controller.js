import User from "../models/user.model.js";
import { Webhook } from "svix";


export const clerkWebhook = async (req, res) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

   if(!WEBHOOK_SECRET){
    return res.status(500).json({
        message: "Webhook secret is not configured!"
    });
   }

   const payload = req.body.toString();
    const headers = req.headers;

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt;
    try {
        evt = wh.verify(payload, headers);
    } catch (err) {
        return res.status(400).json({
            message: "Webhook verification failed", 
        });
    }

    if (evt.type === "user.created") {
        const newUser = new User({
            clerkUserId: evt.data.id,
            username: evt.data.username || evt.data.email_addresses[0].email_address.split('@')[0],
            email: evt.data.email_addresses[0].email_address,
            img: evt.data.profile_image_url,
        });

        await newUser.save();
    }

   return res.status(200).json({
       message: "Webhook processed successfully"
   });
}