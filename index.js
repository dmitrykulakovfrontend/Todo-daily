let editing = false;
let completed_amount = 0;
let creating = false;
let tasks_obj = {
  tasks: [],
  order: 0,
};
document.addEventListener("DOMContentLoaded", () => {
  load_today_page();

  const nav_links = document.querySelectorAll(
    ".time-navigation-list > .nav-link"
  );
  const ellipsis_icons = document.querySelectorAll(".fa-ellipsis");
  const trash_can_icons = document.querySelectorAll(".delete");
  const complete_task_icons = document.querySelectorAll(".complete-task-icon");
  const edit_icons = document.querySelectorAll(".fa-pen-to-square");
  const add_task_button = document.querySelector(".add-task");
  const agree_creating_button = document.querySelector(
    ".tasks > .task-menu-div .agree"
  );
  const decline_creating_button = document.querySelector(
    ".tasks > .task-menu-div .decline"
  );

  for (let nav_link of nav_links) {
    nav_link.addEventListener("click", toggle_active_page);
  }

  for (let icon of ellipsis_icons) {
    icon.addEventListener("click", toggle_ellipsis_popup);
  }

  for (let icon of trash_can_icons) {
    icon.addEventListener("click", delete_task);
  }

  for (let icon of edit_icons) {
    icon.addEventListener("click", edit_task);
  }

  for (let icon of complete_task_icons) {
    icon.addEventListener("click", complete_task);
  }

  add_task_button.addEventListener("click", activate_task_menu);

  agree_creating_button.addEventListener("click", finish_task_form);
  decline_creating_button.addEventListener("click", cancel_task_menu);
});

const uuid = () => Date.now().toString(36) + Math.random().toString(36);

const toggle_profile_popup = () => {
  const profile_popup = document.querySelector(".profile-popup");

  profile_popup.classList.toggle("active");
};

const toggle_ellipsis_popup = (e) => {
  const popup = e.target.parentElement.parentElement.children[2];

  popup.classList.toggle("active");
};

const toggle_active_page = (e) => {
  const nav_links = document.querySelectorAll(
    ".time-navigation-list > .nav-link"
  );
  const next_page = e.currentTarget.querySelector("span").innerText;
  const current_page = document.querySelector(".current-page").innerText;

  if (next_page === current_page) return;

  nav_links.forEach((link) => link.classList.remove("active"));

  e.currentTarget.classList.toggle("active");

  if ((next_page === "Today") & (next_page !== current_page)) {
    load_today_page();
  }
  switch (next_page) {
    case "Today":
      load_today_page();
      break;
    case "Yesterday":
      load_yesterday_page();
      break;
    case "Upcoming":
      load_upcoming_page();
      break;
    default:
      load_today_page();
      break;
  }
};

const load_today_page = () => {
  const tasks_list = document.querySelector(".tasks-list");
  const current_page = document.querySelector(".current-page");
  const current_time = document.querySelector(".current-time");
  const completed_tasks = document.querySelector(".completed-tasks");
  const today = new Date().toDateString();
  document.querySelector(".days").style.display = "none";

  current_page.innerText = "Today";
  current_time.innerText = today;
  const task_obj = get_tasks(today);

  tasks_list.innerHTML = "";
  completed_amount = 0;

  task_obj.tasks_info.tasks.forEach((task) => {
    display_task(task);
    if (task.completed) completed_amount++;
  });

  completed_tasks.innerText = `${completed_amount}/${task_obj.tasks_info.tasks.length} completed`;
};

const load_yesterday_page = () => {
  const tasks_list = document.querySelector(".tasks-list");
  const current_page = document.querySelector(".current-page");
  const current_time = document.querySelector(".current-time");
  const completed_tasks = document.querySelector(".completed-tasks");
  const yesterday = new Date(new Date() - 86400000).toDateString();
  document.querySelector(".days").style.display = "none";

  current_page.innerText = "Yesterday";
  current_time.innerText = yesterday;
  load_day_tasks(yesterday);
};

const load_upcoming_page = () => {
  const tasks_list = document.querySelector(".tasks-list");
  const current_page = document.querySelector(".current-page");
  const current_time = document.querySelector(".current-time");
  const completed_tasks = document.querySelector(".completed-tasks");
  const days_list = document.querySelector(".days-list");
  const seven_days_ms = 604800000;
  const one_day_ms = 86400000;

  let time = new Date(new Date() - seven_days_ms);

  document.querySelector(".days").style.display = "block";
  days_list.innerHTML = "";

  for (let i = 0; i < 15; i++) {
    let li = document.createElement("li");
    li.classList.add("day");
    if (time.getDate() === new Date().getDate()) li.classList.add("active");
    li.innerText = time.getDate();
    li.dataset.time = time.toDateString();
    time = new Date(time.getTime() + one_day_ms);
    days_list.append(li);
  }

  days_list.addEventListener("click", change_active_day);

  current_page.innerText = "Upcoming";
  current_time.innerText = new Date().toDateString();
  load_day_tasks();
};

const change_active_day = (e) => {
  if (!e.target.classList.contains("day")) return;
  const current_time = document.querySelector(".current-time");
  const days = document.querySelectorAll(".day");

  for (const day of days) {
    day.classList.remove("active");
  }

  e.target.classList.add("active");
  current_time.innerText = new Date(e.target.dataset.time).toDateString();

  load_day_tasks(e.target.dataset.time);
};

const load_day_tasks = (time) => {
  const tasks_obj = get_tasks(time);
  const tasks_list = document.querySelector(".tasks-list");
  const current_page = document.querySelector(".current-page");
  const completed_tasks = document.querySelector(".completed-tasks");

  tasks_list.innerHTML = "";
  completed_amount = 0;

  tasks_obj.tasks_info.tasks.forEach((task) => {
    display_task(task);
    if (task.completed) completed_amount++;
  });

  completed_tasks.innerText = `${completed_amount}/${tasks_obj.tasks_info.tasks.length} completed`;
};

const activate_task_menu = () => {
  if (editing) return;
  const add_task_button = document.querySelector(".add-task");
  const task_menu = document.querySelector(".tasks > .task-menu-div");
  const agree_creating_button = document.querySelector(
    ".tasks > .task-menu-div .agree"
  );

  add_task_button.style.display = "none";
  task_menu.style.display = "block";
  agree_creating_button.innerText = "Add";
  creating = true;
};

const finish_task_form = () => {
  const id = uuid();
  const add_task_button = document.querySelector(".add-task");
  const completed_tasks = document.querySelector(".completed-tasks");
  const task_menu = document.querySelector(".tasks > .task-menu-div");
  const task_title = document.querySelector(".new-task-title");

  let task_desc = document.querySelector(".new-task-description");
  let task_obj = get_tasks();

  const task = {
    title: task_title.value,
    desc: task_desc.value,
    time: new Date().toUTCString(),
    order: task_obj.tasks_info.order,
    id,
  };
  task_obj.tasks_info.order += 1;
  task_obj.tasks_info.tasks.push(task);

  if (!is_valid_task()) return;

  localStorage.setItem(task_obj.time, JSON.stringify(task_obj.tasks_info));
  display_task(task);
  completed_tasks.innerText = `${completed_amount}/${task_obj.tasks_info.tasks.length} completed`;

  add_task_button.style.display = "block";
  task_menu.style.display = "none";

  task_title.value = "";
  task_desc.value = "";
  creating = false;
};

const finish_editing_form = (e) => {
  const current_task = document.querySelector(".current-editing-task");
  const task_menu = document.querySelector(".tasks-list > .task-menu-div");
  const new_task_title = document.querySelector(".new-task-title");
  const completed_tasks = document.querySelector(".completed-tasks");
  const new_task_desc = document.querySelector(".new-task-description");
  const task_id = current_task.dataset.id;

  if (!is_valid_task()) return;

  let task_obj = get_tasks();

  const previous_task_index = task_obj.tasks_info.tasks.findIndex(
    (task) => task.id === task_id
  );
  const previous_task = task_obj.tasks_info.tasks[previous_task_index];
  const new_task = {
    title: new_task_title.value,
    desc: new_task_desc.value,
    time: previous_task.time,
    order: previous_task.order,
    edited: new Date().toUTCString(),
    id: task_id,
  };
  if (previous_task.completed) new_task.completed = true;

  task_obj.tasks_info.tasks[previous_task_index] = new_task;

  localStorage.setItem(task_obj.time, JSON.stringify(task_obj.tasks_info));
  update_task(new_task);
  completed_tasks.innerText = `${completed_amount}/${task_obj.tasks_info.tasks.length} completed`;

  task_menu.remove();

  editing = false;
};

const delete_task = (e) => {
  if (editing) return;
  const completed_tasks = document.querySelector(".completed-tasks");
  const task = e.currentTarget.parentElement.parentElement.parentElement;
  const task_id = task.dataset.id;
  const tasks_obj = get_tasks();
  const task_index = tasks_obj.tasks_info.tasks.findIndex(
    (task) => task.id === task_id
  );

  tasks_obj.tasks_info.tasks.splice(task_index, 1);

  localStorage.setItem(tasks_obj.time, JSON.stringify(tasks_obj.tasks_info));

  if (task.classList.contains("completed")) completed_amount--;
  task.remove();

  completed_tasks.innerText = `${completed_amount}/${tasks_obj.tasks_info.tasks.length} completed`;
};

const edit_task = (e) => {
  if (editing) return;
  if (creating) return;

  const task = e.currentTarget.parentElement.parentElement.parentElement;
  const desc = task.querySelector(".task-description").innerText;
  const title = task.querySelector(".task-title").innerText;

  task.classList.add("current-editing-task");

  const task_menu = document.createElement("div");
  task_menu.classList.add("task-menu-div");
  task_menu.style.display = "block";
  task_menu.innerHTML = `
  <form class="task-menu">
    <input type="text" class="new-task-title" placeholder="Task title" value="${title}">
    <textarea class="new-task-description" placeholder="Description">${desc}</textarea>
  </form>
  <button class="btn btn-red agree edit">Edit</button>
  <button class="btn btn-white decline edit">Cancel</button>`;
  task.after(task_menu);
  document
    .querySelector("button.agree.edit")
    .addEventListener("click", finish_editing_form);
  document
    .querySelector("button.decline.edit")
    .addEventListener("click", cancel_editing);
  editing = true;
};

const complete_task = (e) => {
  const completed_tasks = document.querySelector(".completed-tasks");
  const task = e.currentTarget.parentElement;
  const task_id = task.dataset.id;
  const task_obj = get_tasks();
  const task_index = task_obj.tasks_info.tasks.findIndex(
    (task) => task.id === task_id
  );

  task.classList.add("completed");
  task_obj.tasks_info.tasks[task_index].completed = true;

  localStorage.setItem(task_obj.time, JSON.stringify(task_obj.tasks_info));
  console.log(e.currentTarget);
  e.currentTarget.remove();

  completed_amount++;
  completed_tasks.innerText = `${completed_amount}/${task_obj.tasks_info.tasks.length} completed`;
};

const display_task = (task) => {
  const tasks_list = document.querySelector(".tasks-list");
  const task_li = document.createElement("li");
  task_li.classList.add("task");
  if (task.completed) task_li.classList.add("completed");

  task_li.dataset.id = task.id;

  task_li.innerHTML = `
  ${
    task.completed
      ? ""
      : '<i class="fa-solid fa-circle-check  complete-task-icon" title="Complete task"></i>'
  }
  <div class="task-content">
  <div class="task-info">
    <p class="task-title">${task.title}</p>
    <p class="task-description">${task.desc}</p>
    <p class="task-description">Created: ${task.time}</p>
    <p class="task-description edited">${
      task.edited ? `Edited: ${task.edited}` : ""
    }</p>
  </div>
  <div class="task-interaction">
    <i class="fa-solid fa-pen-to-square small-text"></i>
    <i class="fa-solid fa-ellipsis small-text"></i>
  </div>
  <div class="ellipsis-popup">
    <div class="menu-item delete">
      <i class="fa-solid fa-trash-can"></i>
      <span class="red-text">Delete</span>
    </div>
  </div>
  </div>
  `;
  task_li
    .querySelector(".fa-ellipsis")
    .addEventListener("click", toggle_ellipsis_popup);

  task_li
    .querySelector(".fa-pen-to-square")
    .addEventListener("click", edit_task);

  task_li.querySelector(".delete").addEventListener("click", delete_task);

  task_li
    .querySelector(".complete-task-icon")
    ?.addEventListener("click", complete_task);

  tasks_list.append(task_li);
};

const get_tasks = (time) => {
  let tasks_obj = {
    tasks: [],
    order: 0,
  };

  if (!time) time = document.querySelector(".current-time").innerText;

  if (localStorage.getItem(time)) {
    tasks_obj = JSON.parse(localStorage.getItem(time));
  }

  tasks_obj.tasks.sort((task1, task2) =>
    task1.order > task2.order ? 1 : task2.order > task1.order ? -1 : 0
  );

  return {
    tasks_info: tasks_obj,
    time,
  };
};

const update_task = (task_obj) => {
  const task = document.querySelector(".current-editing-task");
  task.querySelector(".task-title").innerText = task_obj.title;
  task.querySelector(".task-description").innerText = task_obj.desc;
  if (task_obj.edited) {
    task.querySelector(
      ".task-description.edited"
    ).innerText = `Edited: ${task_obj.edited}`;
  }
  task.classList.remove("current-editing-task");
};

const is_valid_task = () => {
  const task_title = document.querySelector(".new-task-title");
  const task_desc = document.querySelector(".new-task-description");
  const previous_task_desc = document.querySelector(
    ".new-task-description"
  ).value;

  if (task_title.value.trim() === "" || task_desc.value.trim() === "") {
    task_desc.value = "Fields cant be empty.";

    setTimeout(() => {
      task_desc.value = previous_task_desc;
    }, 1000);

    return false;
  }

  return true;
};

const cancel_task_menu = () => {
  const add_task_button = document.querySelector(".add-task");
  const task_menu = document.querySelector(".tasks > .task-menu-div");
  const task_title = document.querySelector(".new-task-title");
  const task_desc = document.querySelector(".new-task-description");

  add_task_button.style.display = "block";
  task_menu.style.display = "none";

  task_title.value = "";
  task_desc.value = "";
  creating = false;
};

const cancel_editing = () => {
  const task_menu = document.querySelector(".task-menu-div");
  const task = document.querySelector(".current-editing-task");

  task_menu.remove();
  task.classList.remove("current-editing-task");

  editing = false;
};
