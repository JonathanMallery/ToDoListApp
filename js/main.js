import ToDoList from "./todolist.js";
import ToDoItem from "./todoitem.js";

const toDoList = new ToDoList();

// Launch app
document.addEventListener("readystatechange", (event) => {
    if(event.target.readyState === "complete"){
        initApp();
    }
});

const initApp = () => {
    // listeners
    const itemEntryForm = document.getElementById("itemEntryForm");
    itemEntryForm.addEventListener("submit", (event) => {
        event.preventDefault();
        processSubmission();
    });

    const clearItems = document.getElementById("clearItems");
    clearItems.addEventListener("click", (event) => {
        const list = toDoList.getList();
        if (list.length) {
            const confirmed = confirm("Do you want to clear the entire list? 🤔");
            if (confirmed) {
                toDoList.clearList();
                //update the persistent data
                updatePersistentData(toDoList.getList());
                refreshThePage();
            }
        }
    });

    //Load list object
    loadListObject();

    //refresh page
    refreshThePage();
};

const loadListObject = () => {
    const storedList = localStorage.getItem("myToDoList");
    if (typeof storedList !== "string") return;
    const parsedList = JSON.parse(storedList);
    parsedList.forEach(itemObj => {
        const newToDoItem = createNewItem(itemObj._id, itemObj._item);
        toDoList.addItemToList(newToDoItem);
    });
};

const refreshThePage = () => {
    
    clearListDisplay();

    renderList();

    clearItemEntryField();

    setFocusOnItemEntry();
};

const processSubmission = () => {
    const newEntryText = getNewEntry();
    if (!newEntryText.length) return;
    const nextItemId = calcNextItemId();
    const toDoItem = createNewItem(nextItemId, newEntryText);
    toDoList.addItemToList(toDoItem);
    // for assessability screen reader sensibility
    updateScreenReaderConfirmation(newEntryText, "added to the list");
    //update the persistent data
    updatePersistentData(toDoList.getList());
    refreshThePage();
};

const updatePersistentData = (listArray) => {
    localStorage.setItem("myTodoList", JSON.stringify(listArray));
};

const clearListDisplay = () => {
    const listItemsDiv = document.getElementById("listItems");
    deleteContents(listItemsDiv);
};

const deleteContents = (listItemsDiv) => {
    let itemDiv = listItemsDiv.lastElementChild;
    while(itemDiv){
        listItemsDiv.removeChild(itemDiv);
        itemDiv = listItemsDiv.lastElementChild;
    }
};

const renderList = () => {
    const list = toDoList.getList();
    list.forEach(item => {
        buildListItem(item);
    });
};

const buildListItem = (item) => {
    const div = document.createElement("div");
    div.className = "item";
    const check = document.createElement("input");
    check.type = "checkbox";
    check.id = item.getId();
    check.tabIndex = 0;

    const label = document.createElement("label");
    label.htmlFor = item.getId();
    label.textContent = item.getItem();

    div.appendChild(check);
    div.appendChild(label);

    const container = document.getElementById("listItems");
    container.appendChild(div);

    addClickListenerToCheckbox(check);
};

const addClickListenerToCheckbox = (checkbox) => {
    checkbox.addEventListener("click", (event) => {
        // grabbing the _item to be paramenter for updateScreenReaderConfirmation()
        const removedText = getLabelText(checkbox.id);
        toDoList.removeItemFromList(checkbox.id);
        // update the persistent data
        updatePersistentData(toDoList.getList());
        setTimeout(() => { refreshThePage(); }, 2300);
        // for assessability screen reader sensibility
        updateScreenReaderConfirmation(removedText, "removed from list");
    });
};

const getLabelText = (checkboxId) => {
    return document.getElementById(checkboxId).nextElementSibling.textContent;
};

const clearItemEntryField = () => {
    document.getElementById("newItem").value = "";
};

const setFocusOnItemEntry = () => {
    document.getElementById("newItem").focus();
};



const getNewEntry = () => {
    return document.getElementById("newItem").value.trim();
};

const calcNextItemId = () => {
    let nextItemId = 1;
    const list = toDoList.getList();
    if (list.length > 0){
        nextItemId = list[list.length - 1].getId() + 1;
    }
    return nextItemId;
};

const createNewItem = (itemId, itemText) => {
    const toDo = new ToDoItem();
    toDo.setId(itemId);
    toDo.setItem(itemText);
    return toDo;
};

const updateScreenReaderConfirmation = (newEntryText, actionVerb) => {
    document.getElementById("confirmation").textContent = `${newEntryText} ${actionVerb}.`;
};