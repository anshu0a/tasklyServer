const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const biio = "Turning daily tasks into fun challenges, Taskly keeps me focused, motivated, and on track while making productivity surprisingly enjoyable. Every goal feels exciting, progress is visible, and growth becomes effortless."
const covers = [
  "https://res.cloudinary.com/denrzaquu/image/upload/e_blur:400/v1764108108/wallpaperflare.com_wallpaper_8_sitwav.jpg",
  "https://res.cloudinary.com/denrzaquu/image/upload/e_blur:400/v1764108109/wallpaperflare.com_wallpaper_5_mqs1ja.jpg",
  "https://res.cloudinary.com/denrzaquu/image/upload/e_blur:400/v1764108109/wallpaperflare.com_wallpaper_6_bswf9a.jpg",
  "https://res.cloudinary.com/denrzaquu/image/upload/e_blur:400/v1764108111/wallpaperflare.com_wallpaper_2_a2vu3x.jpg",
  "https://res.cloudinary.com/denrzaquu/image/upload/e_blur:400/v1764108110/wallpaperflare.com_wallpaper_3_rshuxo.jpg",
  "https://res.cloudinary.com/denrzaquu/image/upload/e_blur:400/v1764108109/wallpaperflare.com_wallpaper_7_fpon1u.jpg",
  "https://res.cloudinary.com/denrzaquu/image/upload/e_blur:400/v1764108110/wallpaperflare.com_wallpaper_4_lg4xcb.jpg",
  "https://res.cloudinary.com/denrzaquu/image/upload/e_blur:400/v1764108111/wallpaperflare.com_wallpaper_1_dz8u2v.jpg",

]

const profiles = [
  "https://res.cloudinary.com/denrzaquu/image/upload/v1764150570/23_c2ew8g.svg",
  "https://res.cloudinary.com/denrzaquu/image/upload/v1764150570/27_brvmgj.svg",
  "https://res.cloudinary.com/denrzaquu/image/upload/v1764150570/26_jilvbc.svg",
  "https://res.cloudinary.com/denrzaquu/image/upload/v1764150570/22_nq8ueo.svg",
  "https://res.cloudinary.com/denrzaquu/image/upload/v1764150567/6_dpdvcq.svg",

  "https://res.cloudinary.com/denrzaquu/image/upload/v1764150568/19_m0zx5l.svg",
  "https://res.cloudinary.com/denrzaquu/image/upload/v1764150568/14_gdndhg.svg",
  "https://res.cloudinary.com/denrzaquu/image/upload/v1764150410/sea-1-svgrepo-com_ms5fbf.svg",

  "https://res.cloudinary.com/denrzaquu/image/upload/v1764150398/hanger-svgrepo-com_hbermy.svg",
  "https://res.cloudinary.com/denrzaquu/image/upload/v1764150398/balloons-svgrepo-com_huyjqp.svg",
  "https://res.cloudinary.com/denrzaquu/image/upload/v1764150393/christmas-tree-svgrepo-com_j5px3e.svg",
  "https://res.cloudinary.com/denrzaquu/image/upload/v1764150399/bathtub-bath-svgrepo-com_nfd3ji.svg",
  "https://res.cloudinary.com/denrzaquu/image/upload/v1764150397/feeding-chair-baby-chair-svgrepo-com_nlplzb.svg",

  "https://res.cloudinary.com/denrzaquu/image/upload/v1764150398/diwali-lamp-svgrepo-com_upf7sh.svg",
  "https://res.cloudinary.com/denrzaquu/image/upload/v1764150397/heart-svgrepo-com_cddwkg.svg",
  "https://res.cloudinary.com/denrzaquu/image/upload/v1764150397/balloons-heart-svgrepo-com_ta8bqx.svg",
  "https://res.cloudinary.com/denrzaquu/image/upload/v1764150396/key-password-svgrepo-com_d7ngbt.svg",
  "https://res.cloudinary.com/denrzaquu/image/upload/v1764150395/wedding-rings-diamond-svgrepo-com_ilrym7.svg",

  "https://res.cloudinary.com/denrzaquu/image/upload/v1764150395/toast-wine-svgrepo-com_uihqwp.svg",
  "https://res.cloudinary.com/denrzaquu/image/upload/v1764150393/hat-gangster-svgrepo-com_mphonr.svg",
  "https://res.cloudinary.com/denrzaquu/image/upload/v1764150394/broken-heart-svgrepo-com_isnsul.svg",
  "https://res.cloudinary.com/denrzaquu/image/upload/v1764150393/hat-christmas-svgrepo-com_mwym2o.svg",
  "https://res.cloudinary.com/denrzaquu/image/upload/v1764150393/thinking-love-svgrepo-com_qzklzk.svg"
];



const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: { type: String },
  bio: { type: String, default: biio },
  name: { type: String },
  profession: { type: String, default: "Tasklers" },
  photo: { type: String, default: () => profiles[Math.floor(Math.random() * profiles.length)] },
  cover: { type: String, default: () => covers[Math.floor(Math.random() * covers.length)] },
  email: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  provider: { type: String },
  merit: { type: Number, default: 100 },
  mobile: { type: Number },
  birth: { type: Date },

  links: [
    {
      addedAt: { type: Date, default: Date.now },
      goto: { type: String },
      title: { type: String },
      type: { type: String },
    }
  ],
  tasks: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
      addedAt: { type: Date, default: Date.now },
      spend: { type: Number, default: 0 },
      isDone: { type: Boolean, default: false },
      cmt: [
        {
          msg: { type: String },
          createdAt: { type: Date, default: Date.now },
          person: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        }
      ]
    }
  ],

  challenges: [
    {
      dare: { type: mongoose.Schema.Types.ObjectId, ref: "Dare" },
      addedAt: { type: Date, default: Date.now },
      progress: { type: Number, default: 0 },
      streek: { type: Number, default: 0 },
      lastDone: { type: Date, default: () => new Date(Date.now() - 24 * 60 * 60 * 1000) },
      lastAction: { type: Date, default: Date.now },
      by: { type: String, default: 'm' },
      allDares: [
        {
          one: { type: String, required: true },
          isDone: { type: Boolean, default: false }
        }
      ],
    },
  ]
});

// Hash password before saving (only if password exists)
UserSchema.pre("save", async function (next) {
  if (this.password && this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare password (local login only)
UserSchema.methods.isValidPassword = async function (password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", UserSchema);
