const mongoose = require("mongoose");

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

const TaskSchema = new mongoose.Schema({
    owner:{type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    purpose: { type: String, required: true },
    timeLine: { type: Number },
    createdAt: { type: Date, default: Date.now },
    priority: { type: Number, max: 100 },
    type: { type: String, default: "personal" },
    grab:{type:Number , default :0},
    about: {
        type: String,
        default: "i am very thankfull to anshu, who create this taskly app. so i easly add any task and complete it on time."
    },
    views: [
        { _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" } }
    ],

    voices: [
        {
            filename: String,
            data: Buffer,
            contentType: String,
            uploadedAt: { type: Date }
        }
    ],

    images: {
        type: [
            {
                filename: { type: String, default: "default" },
                path: {
                    type: String,
                    default: () => links[Math.floor(Math.random() * links.length)]
                },
                public_id:{type:String},
            }
        ],
        default: () => [{
            filename: "default",
            path: links[Math.floor(Math.random() * links.length)]
        }]
    }

});

module.exports = mongoose.model("Task", TaskSchema);
