require('dotenv').config()
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const knex = require("./connection/index");
// const moment = require("moment/moment");
const cors = require("cors");

app.use(cors())
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:9200",
    methods: ["GET", "POST"]
  }
});


app.use(express.json());
app.get("/rooms", async (req, res) => {
  try {

    const rooms = await knex("rooms");

    if (rooms && rooms.length > 0) {
      res.status(200).json({
        success: true,
        rooms
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Salas não encontradas"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor railway",
      error
    });
  }
});

app.get("/chat/:id", async (req, res) => {
  try {
    const id = req.params.id
    let chat = await knex.select("chat.*", "users.id as user_id", "users.name")
    .from("chat")
    .join("users", "users.id", "=", "chat.users_id")
    .where({ "chat.rooms_id": id })
    .orderBy("chat.created_at");

    console.log(chat)
    if (chat) {
      chat = chat.map((c) => {
        let newc = { ...c };
        newc["date"] = c.created_at;
        return newc;
      });
      res.status(200).json({
        success: true,
        chat
      })
    } else {
      chat = chat.map((c) => {
        let newc = { ...c };
        newc["date"] = c.created_at
        return newc;
      });
      res.status(202).json({
        success: true,
        message: "Chat não encontrado"
      })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: true,
      message: "Erro no servidor"
    })
  }
})
function generateLightHexColor() {
  // Generate random red, green, and blue values between 128 and 255
  // This will ensure that the generated color is light
  const r = Math.floor(Math.random() * (256 - 128) + 128);
  const g = Math.floor(Math.random() * (256 - 128) + 128);
  const b = Math.floor(Math.random() * (256 - 128) + 128);

  // Convert the RGB values to a hexadecimal string
  const hexColor = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

  return hexColor;
}

// Helper function to convert a decimal number to a two-digit hexadecimal string
function toHex(n) {
  const hex = n.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}
app.post("/chat", async (req, res) => {
  try {
    const data = req.body;
    console.log(data)
    const room = await knex("rooms").where({ id: data.room }).first();
    console.log(room)
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Sala não encontrada"
      });
    }

    const color = generateLightHexColor()
    const user = await knex("users").insert({
      name: data.name,
      rooms_id: room.id,
      color
    });
    console.log(user[0])
    if (!user || user.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor"
      });
    }

    let totalUser = room.qtd_use ? Number(room.qtd_use) + 1 : 1;
    if (totalUser > room.qtd) {
      return res.status(403).json({
        success: false,
        message: "Sala cheia"
      });
    }

    await knex("rooms")
      .update({ qtd_use: totalUser })
      .where({ id: room.id });

    res.status(200).json({
      success: true,
      user: user[0],
      color,
      room,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
});

app.delete("/chat/delete/:users_id", async (req, res) => {
  try {
    const users_id = req.params.users_id;

    const { rooms_id, qtd } = req.body;
    const deleteUserRoom = await knex("users").delete().where({ id: users_id });
    if (!deleteUserRoom) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado"
      });
    }

    let newqtd = Number(qtd) - 1;
    const updatedRoom = await knex("rooms")
      .update({ qtd_use: newqtd })
      .where({ id: rooms_id });

    if (!updatedRoom) {
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor"
      });
    }

    if (newqtd === 0) {
      await knex("chat").where({ rooms_id }).delete();
    }

    res.status(200).json({
      success: true,
      deleted: deleteUserRoom
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("chat message", async ({users_id, rooms_id, messages, color}) => {
    console.log(users_id, rooms_id, messages, color)
    const user = await knex("users").where({ id: users_id }).first();
    if (user) {
      const [id] = await knex("chat").insert({ messages, rooms_id, users_id, color });
      const chat = await knex("chat").where({ id }).first();

      console.log(chat);
      io.emit("chat message", {
        messages: chat.messages,
        name: user.name,
        date: chat.created_at,
        color: color,
        user_id:user.id
      });
    } else {
      io.emit("chat message", { messages: "-", name: "-", date: "-" });
    }
  });
});

const PORT = process.env.PORT || 8232;
http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
