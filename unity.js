const storageKey = "STORAGE_KEY";

const formAddingBook = document.getElementById("inputBook");
const formSearchingBook = document.getElementById("searchBook");

function CheckForStorage() {
  return typeof Storage !== "undefined";
}

formAddingBook.addEventListener("submit", function (event) {
  const title = document.getElementById("inputJudulBuku").value;
  const author = document.getElementById("inputPenulisBuku").value;
  const year = parseInt(document.getElementById("inputTahunBuku").value);
  const isComplete = document.getElementById("inputBukuSelesai").checked;

  const idTemp = document.getElementById("inputJudulBuku").name;
  if (idTemp !== "") {
    const databuku = GetBookList();
    for (let index = 0; index < databuku.length; index++) {
      if (databuku[index].id == idTemp) {
        databuku[index].title = title;
        databuku[index].author = author;
        databuku[index].year = year;
        databuku[index].isComplete = isComplete;
      }
    }
    localStorage.setItem(storageKey, JSON.stringify(databuku));
    ResetAllForm();
    RenderBookList(databuku);
    return;
  }

  const id = JSON.parse(localStorage.getItem(storageKey)) === null ? 0 + Date.now() : JSON.parse(localStorage.getItem(storageKey)).length + Date.now();
  const newBook = {
    id: id,
    title: title,
    author: author,
    year: year,
    isComplete: isComplete,
  };

  PutBookList(newBook);

  const databuku = GetBookList();
  RenderBookList(databuku);
});

function PutBookList(data) {
  if (CheckForStorage()) {
    let databuku = [];

    if (localStorage.getItem(storageKey) !== null) {
      databuku = JSON.parse(localStorage.getItem(storageKey));
    }

    databuku.push(data);
    localStorage.setItem(storageKey, JSON.stringify(databuku));
  }
}

function RenderBookList(databuku) {
  if (databuku === null) {
    return;
  }

  const containerIncomplete = document.getElementById("incompleteBookshelfList");
  const containerComplete = document.getElementById("completeBookshelfList");

  containerIncomplete.innerHTML = "";
  containerComplete.innerHTML = "";
  for (let book of databuku) {
    const id = book.id;
    const title = book.title;
    const author = book.author;
    const year = book.year;
    const isComplete = book.isComplete;

    //create isi item
    let bookItem = document.createElement("article");
    bookItem.classList.add("book_item", "select_item");
    bookItem.innerHTML = "<h3 name = " + id + ">" + title + "</h3>";
    bookItem.innerHTML += "<p>Penulis: " + author + "</p>";
    bookItem.innerHTML += "<p>Tahun: " + year + "</p>";

    //container action item
    let containerActionItem = document.createElement("div");
    containerActionItem.classList.add("action");

    //green button
    const greenButton = CreateGreenButton(book, function (event) {
      isCompleteBookHandler(event.target.parentElement.parentElement);

      const databuku = GetBookList();
      ResetAllForm();
      RenderBookList(databuku);
    });

    //red button
    const redButton = CreateRedButton(function (event) {
      DeleteAnItem(event.target.parentElement.parentElement);

      const databuku = GetBookList();
      ResetAllForm();
      RenderBookList(databuku);
    });

    containerActionItem.append(greenButton, redButton);

    bookItem.append(containerActionItem);

    //incomplete book
    if (isComplete === false) {
      containerIncomplete.append(bookItem);
      bookItem.childNodes[0].addEventListener("click", function (event) {
        UpdateAnItem(event.target.parentElement);
      });

      continue;
    }

    //complete book
    containerComplete.append(bookItem);

    bookItem.childNodes[0].addEventListener("click", function (event) {
      UpdateAnItem(event.target.parentElement);
    });
  }
}

function CreateGreenButton(book, eventListener) {
  const isSelesai = book.isComplete ? "Belum selesai" : "Selesai";

  const greenButton = document.createElement("button");
  greenButton.classList.add("green");
  greenButton.innerText = isSelesai + " di Baca";
  greenButton.addEventListener("click", function (event) {
    eventListener(event);
  });
  return greenButton;
}
function CreateRedButton(eventListener) {
  const redButton = document.createElement("button");
  redButton.classList.add("red");
  redButton.innerText = "Hapus buku";
  redButton.addEventListener("click", function (event) {
    eventListener(event);
  });
  return redButton;
}

function isCompleteBookHandler(itemElement) {
  const databuku = GetBookList();
  if (databuku.length === 0) {
    return;
  }

  const title = itemElement.childNodes[0].innerText;
  const titleNameAttribut = itemElement.childNodes[0].getAttribute("name");
  for (let index = 0; index < databuku.length; index++) {
    if (databuku[index].title === title && databuku[index].id == titleNameAttribut) {
      databuku[index].isComplete = !databuku[index].isComplete;
      break;
    }
  }
  localStorage.setItem(storageKey, JSON.stringify(databuku));
}

function SearchBookList(title) {
  const databuku = GetBookList();
  if (databuku.length === 0) {
    return;
  }

  const bookList = [];

  for (let index = 0; index < databuku.length; index++) {
    const tempTitle = databuku[index].title.toLowerCase();
    const tempTitleTarget = title.toLowerCase();
    if (databuku[index].title.includes(title) || tempTitle.includes(tempTitleTarget)) {
      bookList.push(databuku[index]);
    }
  }
  return bookList;
}

function GreenButtonHandler(parentElement) {
  let book = isCompleteBookHandler(parentElement);
  book.isComplete = !book.isComplete;
}

function GetBookList() {
  if (CheckForStorage) {
    return JSON.parse(localStorage.getItem(storageKey));
  }
  return [];
}

function DeleteAnItem(itemElement) {
  const databuku = GetBookList();
  if (databuku.length === 0) {
    return;
  }

  const titleNameAttribut = itemElement.childNodes[0].getAttribute("name");
  for (let index = 0; index < databuku.length; index++) {
    if (databuku[index].id == titleNameAttribut) {
      databuku.splice(index, 1);
      break;
    }
  }

  localStorage.setItem(storageKey, JSON.stringify(databuku));
}

function UpdateAnItem(itemElement) {
  if (itemElement.id === "incompleteBookshelfList" || itemElement.id === "completeBookshelfList") {
    return;
  }

  const databuku = GetBookList();
  if (databuku.length === 0) {
    return;
  }

  const title = itemElement.childNodes[0].innerText;
  const author = itemElement.childNodes[1].innerText.slice(9, itemElement.childNodes[1].innerText.length);
  const getYear = itemElement.childNodes[2].innerText.slice(7, itemElement.childNodes[2].innerText.length);
  const year = parseInt(getYear);

  const isComplete = itemElement.childNodes[3].childNodes[0].innerText.length === "Selesai di baca".length ? false : true;

  const id = itemElement.childNodes[0].getAttribute("name");
  document.getElementById("inputJudulBuku").value = title;
  document.getElementById("inputJudulBuku").name = id;
  document.getElementById("inputPenulisBuku").value = author;
  document.getElementById("inputTahunBuku").value = year;
  document.getElementById("inputBukuSelesai").checked = isComplete;

  for (let index = 0; index < databuku.length; index++) {
    if (databuku[index].id == id) {
      databuku[index].id = id;
      databuku[index].title = title;
      databuku[index].author = author;
      databuku[index].year = year;
      databuku[index].isComplete = isComplete;
    }
  }
  localStorage.setItem(storageKey, JSON.stringify(databuku));
}

searchBook.addEventListener("submit", function (event) {
  event.preventDefault();
  const databuku = GetBookList();
  if (databuku.length === 0) {
    return;
  }

  const title = document.getElementById("searchBookTitle").value;
  if (title === null) {
    RenderBookList(databuku);
    return;
  }
  const bookList = SearchBookList(title);
  RenderBookList(bookList);
});

function ResetAllForm() {
  document.getElementById("inputJudulBuku").value = "";
  document.getElementById("inputPenulisBuku").value = "";
  document.getElementById("inputTahunBuku").value = "";
  document.getElementById("inputBukuSelesai").checked = false;

  document.getElementById("searchBookTitle").value = "";
}

window.addEventListener("load", function () {
  if (CheckForStorage) {
    if (localStorage.getItem(storageKey) !== null) {
      const databuku = GetBookList();
      RenderBookList(databuku);
    }
  } else {
    alert("Browser yang Anda gunakan tidak mendukung Web Storage");
  }
});