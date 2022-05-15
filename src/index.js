const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username == username);
  if (!user) {
    return response.status(400).json({ error: "User does not exists" });
  }
  request.user = user;
  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const usernameTaken = users.some((user) => user.username == username);
  if (usernameTaken) {
    return response.status(400).json({ error: "username already taken" });
  }
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };
  users.push(newUser);
  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos).send();
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  user.todos.push(newTodo);
  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;
  const selectedTodo = user.todos.find((todo) => todo.id === id);
  if (!selectedTodo) {
    return response
      .status(404)
      .json({ error: "Todo id non existent for user" });
  }
  selectedTodo.title = title;
  selectedTodo.deadline = deadline;
  return response.status(201).json(selectedTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const selectedTodo = user.todos.find((todo) => todo.id === id);
  if (!selectedTodo) {
    return response
      .status(404)
      .json({ error: "Todo id non existent for user" });
  }
  selectedTodo.done = true;
  return response.status(200).json(selectedTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const selectedTodo = user.todos.find((todo) => todo.id === id);
  if (!selectedTodo) {
    return response
      .status(404)
      .json({ error: "Todo id non existent for user" });
  }
  user.todos.splice(selectedTodo, 1);
  return response.status(204).send();
});

module.exports = app;
