const mongoose = require("mongoose");
const desc = "Accept this dare and challenge yourself to stay committed till the end. Every single day you complete this task, you grow stronger, sharper, and more confident. Keep going, stay unstoppable, and enjoy the journey of self-improvement."
const videos = [
    "https://res.cloudinary.com/denrzaquu/video/upload/v1763216162/1448735-uhd_4096_2160_24fps_rqatfz.mp4",
    "https://res.cloudinary.com/denrzaquu/video/upload/v1763216159/4035966-uhd_3840_2160_24fps_t1kq0k.mp4",
    "https://res.cloudinary.com/denrzaquu/video/upload/v1763216158/854999-uhd_3840_2160_30fps_smxkdi.mp4",
    "https://res.cloudinary.com/denrzaquu/video/upload/v1763216154/4203127-uhd_3840_2160_25fps_oonitu.mp4",
    "https://res.cloudinary.com/denrzaquu/video/upload/v1763216153/1172097-hd_1920_1080_30fps_wbsnmu.mp4",
    "https://res.cloudinary.com/denrzaquu/video/upload/v1763216148/2257010-uhd_3840_2160_24fps_cdrucv.mp4",
    "https://res.cloudinary.com/denrzaquu/video/upload/v1763216147/3832198-uhd_4096_2160_25fps_tiyk1d.mp4",
    "https://res.cloudinary.com/denrzaquu/video/upload/v1763216143/1093650-uhd_3840_2160_30fps_ogfw82.mp4",
    "https://res.cloudinary.com/denrzaquu/video/upload/v1763216139/855195-uhd_3840_2160_30fps_epjzzm.mp4",
    "https://res.cloudinary.com/denrzaquu/video/upload/v1763216129/2081238-uhd_3840_2160_24fps_lkhbjm.mp4",
    "https://res.cloudinary.com/denrzaquu/video/upload/v1763216124/2231485-uhd_3840_2160_24fps_ggogf7.mp4",
    "https://res.cloudinary.com/denrzaquu/video/upload/v1763216120/4272432-uhd_4096_2160_25fps_hyfcbj.mp4",
    "https://res.cloudinary.com/denrzaquu/video/upload/v1763216113/3769037-hd_1920_1080_25fps_mzyxds.mp4",
    "https://res.cloudinary.com/denrzaquu/video/upload/v1763216113/4323285-hd_1920_1080_30fps_pylp6z.mp4",
    "https://res.cloudinary.com/denrzaquu/video/upload/v1763216112/4017224-uhd_3840_2160_30fps_epmiej.mp4",
    "https://res.cloudinary.com/denrzaquu/video/upload/v1763216106/857021-hd_1920_1080_30fps_ie701z.mp4",
    "https://res.cloudinary.com/denrzaquu/video/upload/v1763216104/3723069-hd_1920_1080_30fps_wnnmbe.mp4",
    "https://res.cloudinary.com/denrzaquu/video/upload/v1763216093/857267-hd_1920_1080_24fps_odej2t.mp4",
    "https://res.cloudinary.com/denrzaquu/video/upload/v1763216092/3161307-hd_1920_1080_24fps_v5kanc.mp4",
    "https://res.cloudinary.com/denrzaquu/video/upload/v1763216091/4066322-uhd_3840_2160_24fps_uyxalm.mp4",
    "https://res.cloudinary.com/denrzaquu/video/upload/v1763216084/3752531-hd_1920_1080_24fps_rdd7bh.mp4",
    "https://res.cloudinary.com/denrzaquu/video/upload/v1763216084/857026-hd_1920_1080_30fps_wp8sjr.mp4",
    "https://res.cloudinary.com/denrzaquu/video/upload/v1763216084/1494295-hd_1920_1080_24fps_mcrgxk.mp4",
    "https://res.cloudinary.com/denrzaquu/video/upload/v1763216080/854701-hd_1920_1080_24fps_pnq2ny.mp4",
    "https://res.cloudinary.com/denrzaquu/video/upload/v1763216076/4800433-hd_1280_720_30fps_upoyet.mp4",
    "https://res.cloudinary.com/denrzaquu/video/upload/v1763216075/856777-hd_1920_1080_30fps_llt8uz.mp4",
    "https://res.cloudinary.com/denrzaquu/video/upload/v1763216069/3744556-hd_1920_1080_30fps_y6i7dz.mp4",
    "https://res.cloudinary.com/denrzaquu/video/upload/v1763216065/7272375-hd_1920_1080_25fps_rsnhnj.mp4",
    "https://res.cloudinary.com/denrzaquu/video/upload/v1763216064/Unconfirmed_51617_zpgusl.mp4",
    "https://res.cloudinary.com/denrzaquu/video/upload/v1763216057/4480575-hd_1920_1080_30fps_vlws8e.mp4"
];

const links = [
    "https://res.cloudinary.com/denrzaquu/image/upload/v1758348434/hh_wcbuq3.jpg",
    "https://res.cloudinary.com/denrzaquu/image/upload/v1758347884/wallpaperflare.com_wallpaper_1_l8nrwh.jpg",
    "https://res.cloudinary.com/denrzaquu/image/upload/v1758347882/wallpaperflare.com_wallpaper_4_tt3zgo.jpg",
    "https://res.cloudinary.com/denrzaquu/image/upload/v1758347881/wallpaperflare.com_wallpaper_2_hhsgme.jpg",
    "https://res.cloudinary.com/denrzaquu/image/upload/v1758347881/wallpaperflare.com_wallpaper_7_grthpn.jpg",
    "https://res.cloudinary.com/denrzaquu/image/upload/v1758347878/wallpaperflare.com_wallpaper_6_gqfgql.jpg",
    "https://res.cloudinary.com/denrzaquu/image/upload/v1758347877/wallpaperflare.com_wallpaper_11_v40eez.jpg",
    "https://res.cloudinary.com/denrzaquu/image/upload/v1758627307/wallpaperflare.com_wallpaper_24_yecaus.jpg",
    "https://res.cloudinary.com/denrzaquu/image/upload/v1758627307/wallpaperflare.com_wallpaper_19_ksipzg.jpg",
    "https://res.cloudinary.com/denrzaquu/image/upload/v1758627309/wallpaperflare.com_wallpaper_18_vdiyxf.jpg",
    "https://res.cloudinary.com/denrzaquu/image/upload/v1758627308/wallpaperflare.com_wallpaper_22_djrevm.jpg",
    "https://res.cloudinary.com/denrzaquu/image/upload/v1758627309/wallpaperflare.com_wallpaper_23_zlb9qn.jpg",
    "https://res.cloudinary.com/denrzaquu/image/upload/v1758627308/wallpaperflare.com_wallpaper_21_yuzqws.jpg",
    "https://res.cloudinary.com/denrzaquu/image/upload/v1758627309/wallpaperflare.com_wallpaper_25_mrmpho.jpg",
    "https://res.cloudinary.com/denrzaquu/image/upload/v1758627310/wallpaperflare.com_wallpaper_20_lmyg6z.jpg",
    "https://res.cloudinary.com/denrzaquu/image/upload/v1758627311/wallpaperflare.com_wallpaper_16_vgnumi.jpg",
    "https://res.cloudinary.com/denrzaquu/image/upload/v1758627312/wallpaperflare.com_wallpaper_17_om89wc.jpg",
    "https://res.cloudinary.com/denrzaquu/image/upload/v1758627312/wallpaperflare.com_wallpaper_15_arfe4s.jpg",
    "https://res.cloudinary.com/denrzaquu/image/upload/v1758627312/wallpaperflare.com_wallpaper_13_f4dxpk.jpg",
    "https://res.cloudinary.com/denrzaquu/image/upload/v1758627312/wallpaperflare.com_wallpaper_14_yagoof.jpg",
];

const DareSchema = new mongoose.Schema({
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    purpose: { type: String, required: true },
    days: { type: Number, default: 7 },
    createdAt: { type: Date, default: Date.now },
    priority: { type: Number, default: 75 },
    type: { type: String, default: "personal" },
    video: { type: String, default: () => videos[Math.floor(Math.random() * videos.length)] },
    desc: { type: String, default: desc },
    views: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    grab: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    allDares: [
        {
            one: { type: String, required: true },   // ✅ SINGLE STRING
            isDone: { type: Boolean, default: false }
        }
    ],
    collab: [
        {
            _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            agree: { type: Boolean, default: false },
        }
    ],
    voices: [
        {
            filename: String,
            data: Buffer,
            contentType: String,
            uploadedAt: { type: Date, default: Date.now },
        }
    ],
    images: {
        type: [
            {
                filename: String,
                path: String,
                public_id: String,
            }
        ],
        default: () => [
            {
                filename: "default",
                path: links[Math.floor(Math.random() * links.length)],
                public_id: "default"
            }
        ]
    },
    cmt: [
        {
            msg: String,
            createdAt: { type: Date, default: Date.now },
            person: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        }
    ]
});


module.exports = mongoose.model("Dare", DareSchema);
