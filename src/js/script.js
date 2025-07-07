    let centralStock = JSON.parse(localStorage.getItem('centralStock')) || [];
    let branchStocks = JSON.parse(localStorage.getItem('branches')) || {};
    let branchNames = Object.keys(branchStocks);

    const {
        centralStock: centralStockDiv,
        stockSections,
        addItemBtn,
        itemName: itemNameInput,
        itemPrice: itemPriceInput,
        itemQuantity: itemQuantityInput,
        itemImage: itemImageInput,
        fileNameContainer,
        fileName: fileNameSpan,
        imagePreview,
        previewImage,
        removeImage,
        addBranchBtn,
        branchName: branchNameInput,
        moveModal,
        modalTitle,
        modalStockInfo,
        moveQuantity: moveQuantityInput,
        totalPrice: totalPriceDisplay,
        cancelMoveBtn,
        confirmMoveBtn,
        editModal,
        editName: editNameInput,
        editPrice: editPriceInput,
        editQuantity: editQuantityInput,
        editImage: editImageInput,
        editImagePreview,
        editPreviewImage,
        editRemoveImage,
        cancelEditBtn,
        confirmEditBtn
    } = {
        centralStock: document.getElementById('centralStock'),
        stockSections: document.getElementById('stockSections'),
        addItemBtn: document.getElementById('addItemBtn'),
        itemName: document.getElementById('itemName'),
        itemPrice: document.getElementById('itemPrice'),
        itemQuantity: document.getElementById('itemQuantity'),
        itemImage: document.getElementById('itemImage'),
        fileNameContainer: document.getElementById('fileNameContainer'),
        fileName: document.getElementById('fileName'),
        imagePreview: document.getElementById('imagePreview'),
        previewImage: document.getElementById('previewImage'),
        removeImage: document.getElementById('removeImage'),
        addBranchBtn: document.getElementById('addBranchBtn'),
        branchName: document.getElementById('branchName'),
        moveModal: document.getElementById('moveModal'),
        modalTitle: document.getElementById('modalTitle'),
        modalStockInfo: document.getElementById('modalStockInfo'),
        moveQuantity: document.getElementById('moveQuantity'),
        totalPrice: document.getElementById('totalPrice'),
        cancelMoveBtn: document.getElementById('cancelMoveBtn'),
        confirmMoveBtn: document.getElementById('confirmMoveBtn'),
        editModal: document.getElementById('editModal'),
        editName: document.getElementById('editName'),
        editPrice: document.getElementById('editPrice'),
        editQuantity: document.getElementById('editQuantity'),
        editImage: document.getElementById('editImage'),
        editImagePreview: document.getElementById('editImagePreview'),
        editPreviewImage: document.getElementById('editPreviewImage'),
        editRemoveImage: document.getElementById('editRemoveImage'),
        cancelEditBtn: document.getElementById('cancelEditBtn'),
        confirmEditBtn: document.getElementById('confirmEditBtn')
    };

    const generateUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });

    const toStorageKey = name => name.toLowerCase().replace(/\s+/g, '-');

    const saveData = () => {
        localStorage.setItem('centralStock', JSON.stringify([...centralStock]));
        localStorage.setItem('branches', JSON.stringify(branchStocks));
    };

    let selectedImage = null;
    let selectedFileName = null;
    itemImageInput.addEventListener('change', ({ target: { files } }) => {
        console.log('Image input changed:', files);
        const [file] = files;
        if (file && file.type.startsWith('image/') && file.size <= 1 * 1024 * 1024) {
            const reader = new FileReader();
            reader.onload = () => {
                selectedImage = reader.result;
                selectedFileName = file.name;
                previewImage.src = selectedImage;
                fileNameSpan.textContent = file.name;
                fileNameContainer.classList.remove('hidden');
                imagePreview.classList.remove('hidden');
                console.log('Image preview displayed:', file.name);
            };
            reader.onerror = () => {
                console.error('FileReader error:', reader.error);
                alert('Error reading image file.');
                itemImageInput.value = '';
                selectedImage = null;
                selectedFileName = null;
                fileNameContainer.classList.add('hidden');
                imagePreview.classList.add('hidden');
                previewImage.src = '';
                fileNameSpan.textContent = '';
            };
            reader.readAsDataURL(file);
        } else {
            console.warn('Invalid file selected:', file ? file.name : 'No file');
            alert('Please upload a valid image (PNG/JPG, max 1MB).');
            itemImageInput.value = '';
            selectedImage = null;
            selectedFileName = null;
            fileNameContainer.classList.add('hidden');
            imagePreview.classList.add('hidden');
            previewImage.src = '';
            fileNameSpan.textContent = '';
        }
    });

    removeImage.addEventListener('click', () => {
        console.log('Remove image clicked');
        selectedImage = null;
        selectedFileName = null;
        itemImageInput.value = '';
        fileNameContainer.classList.add('hidden');
        imagePreview.classList.add('hidden');
        previewImage.src = '';
        fileNameSpan.textContent = '';
        console.log('Image discarded in add form');
    });

    let editSelectedImage = null;
    editImageInput.addEventListener('change', ({ target: { files } }) => {
        console.log('Edit image input changed:', files);
        const [file] = files;
        if (file && file.type.startsWith('image/') && file.size <= 1 * 1024 * 1024) {
            const reader = new FileReader();
            reader.onload = () => {
                editSelectedImage = reader.result;
                editPreviewImage.src = editSelectedImage;
                editImagePreview.classList.remove('hidden');
                console.log('Edit image preview displayed:', file.name);
            };
            reader.onerror = () => {
                console.error('FileReader error in edit modal:', reader.error);
                alert('Error reading image file.');
                editImageInput.value = '';
            };
            reader.readAsDataURL(file);
        } else {
            console.warn('Invalid file selected in edit modal:', file ? file.name : 'No file');
            alert('Please upload a valid image (PNG/JPG, max 1MB).');
            editImageInput.value = '';
        }
    });

    editRemoveImage.addEventListener('click', () => {
        console.log('Edit remove image clicked');
        editSelectedImage = null;
        editImageInput.value = '';
        editImagePreview.classList.add('hidden');
        editPreviewImage.src = '';
        console.log('Image discarded in edit modal');
    });

    const renderStock = (stock, container, location, branchName = null, ...buttonHandlers) => {
        container.innerHTML = '';
        stock.forEach(({ id, name, quantity, price, image }) => {
            const card = document.createElement('div');
            card.className = 'card p-6 rounded-lg shadow-md';
            card.innerHTML = `
                <h3 class="font-semibold text-lg">${name}</h3>
                <p class="text-sm">Quantity: ${quantity}</p>
                <p class="text-sm">Unit Price: Rp ${price.toLocaleString()}</p>
                ${image ? `<img src="${image}" alt="${name}" class="card-image max-w-[150px]">` : ''}
                <div class="mt-4 flex gap-3 flex-wrap">
                    <button class="editBtn btn bg-[#D4A017] text-[#1C2526] px-4 py-2 rounded-md font-semibold" data-id="${id}" data-location="${location}" ${branchName ? `data-branch="${branchName}"` : ''}>Edit</button>
                    <button class="deleteBtn btn bg-[#8B0000] text-[#F5E8C7] px-4 py-2 rounded-md font-semibold" data-id="${id}" data-location="${location}" ${branchName ? `data-branch="${branchName}"` : ''}>Delete</button>
                    ${location === 'central' ? branchNames.map(name => `
                        <button class="moveToBranch btn bg-[#D4A017] text-[#1C2526] px-4 py-2 rounded-md font-semibold" data-id="${id}" data-branch="${name}">Move to ${name}</button>
                    `).join('') : `
                        <button class="moveBack btn bg-[#D4A017] text-[#1C2526] px-4 py-2 rounded-md font-semibold" data-id="${id}" data-location="${location}" data-branch="${branchName}">Move to Central</button>
                        <button class="increment btn bg-[#D4A017] text-[#1C2526] px-4 py-2 rounded-md font-semibold" data-id="${id}" data-location="${location}" data-branch="${branchName}">+</button>
                        <button class="decrement btn bg-[#D4A017] text-[#1C2526] px-4 py-2 rounded-md font-semibold" data-id="${id}" data-location="${location}" data-branch="${branchName}">-</button>
                    `}
                </div>
            `;
            container.appendChild(card);
        });

        const { editHandler = editItem, deleteHandler = deleteItem, moveToBranchHandler = openMoveModal, moveBackHandler = openMoveModal, incrementHandler = incrementStock, decrementHandler = decrementStock } = buttonHandlers[0] || {};
        container.querySelectorAll('.editBtn').forEach(btn => {
            btn.addEventListener('click', () => {
                console.log('Edit button clicked for ID:', btn.dataset.id, 'Location:', btn.dataset.location, 'Branch:', btn.dataset.branch || 'central');
                editHandler(btn.dataset.id, btn.dataset.location, btn.dataset.branch);
            });
        });
        container.querySelectorAll('.deleteBtn').forEach(btn => {
            btn.addEventListener('click', () => {
                console.log('Delete button clicked for ID:', btn.dataset.id, 'Location:', btn.dataset.location, 'Branch:', btn.dataset.branch || 'central');
                deleteHandler(btn.dataset.id, btn.dataset.location, btn.dataset.branch);
            });
        });
        if (location === 'central') {
            container.querySelectorAll('.moveToBranch').forEach(btn => {
                btn.addEventListener('click', () => {
                    console.log('Move to branch button clicked for ID:', btn.dataset.id, 'Branch:', btn.dataset.branch);
                    moveToBranchHandler(btn.dataset.id, 'central', btn.dataset.branch);
                });
            });
        } else {
            container.querySelectorAll('.moveBack').forEach(btn => {
                btn.addEventListener('click', () => {
                    console.log('Move back button clicked for ID:', btn.dataset.id, 'Location:', btn.dataset.location, 'Branch:', btn.dataset.branch);
                    moveBackHandler(btn.dataset.id, btn.dataset.location, 'central', btn.dataset.branch);
                });
            });
            container.querySelectorAll('.increment').forEach(btn => {
                btn.addEventListener('click', () => {
                    console.log('Increment button clicked for ID:', btn.dataset.id, 'Location:', btn.dataset.location, 'Branch:', btn.dataset.branch);
                    incrementHandler(btn.dataset.id, btn.dataset.location, btn.dataset.branch);
                });
            });
            container.querySelectorAll('.decrement').forEach(btn => {
                btn.addEventListener('click', () => {
                    console.log('Decrement button clicked for ID:', btn.dataset.id, 'Location:', btn.dataset.location, 'Branch:', btn.dataset.branch);
                    decrementHandler(btn.dataset.id, btn.dataset.location, btn.dataset.branch);
                });
            });
        }
    };

    const renderAllStocks = () => {
        // Clear existing branch sections
        const existingSections = stockSections.querySelectorAll('section:not(:first-child)');
        existingSections.forEach(section => section.remove());

        // Render Central Stock
        renderStock(centralStock, centralStockDiv, 'central');

        // Render each branch
        branchNames.forEach(name => {
            const section = document.createElement('section');
            section.className = 'section-container p-6 md:p-8 rounded-xl shadow-lg';
            section.innerHTML = `
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-semibold">${name}</h2>
                    <button class="deleteBranchBtn btn bg-[#8B0000] text-[#F5E8C7] px-4 py-2 rounded-md font-semibold" data-branch="${name}" ${branchStocks[name].length > 0 ? 'disabled' : ''}>Delete Branch</button>
                </div>
                <div id="branch-${toStorageKey(name)}" class="space-y-6"></div>
            `;
            stockSections.appendChild(section);
            const branchContainer = document.getElementById(`branch-${toStorageKey(name)}`);
            renderStock(branchStocks[name] || [], branchContainer, 'branch', name);

            // Add delete branch event listener
            section.querySelector('.deleteBranchBtn').addEventListener('click', () => {
                console.log('Delete branch clicked for:', name);
                deleteBranch(name);
            });
        });
    };

    // Add new branch
    addBranchBtn.addEventListener('click', () => {
        const name = branchNameInput.value.trim();
        if (!name) {
            alert('Please enter a valid branch name.');
            return;
        }
        if (branchNames.includes(name)) {
            alert('Branch name already exists.');
            return;
        }
        branchNames.push(name);
        branchStocks[name] = [];
        saveData();
        renderAllStocks();
        branchNameInput.value = '';
        console.log('Branch added:', name);
    });

    // Delete branch
    const deleteBranch = branchName => {
        if (branchStocks[branchName].length > 0) {
            alert('Cannot delete branch with items. Move or delete items first.');
            return;
        }
        delete branchStocks[branchName];
        branchNames = branchNames.filter(name => name !== branchName);
        saveData();
        renderAllStocks();
        console.log('Branch deleted:', branchName);
    };

    // Add new item
    addItemBtn.addEventListener('click', () => {
        const name = itemNameInput.value.trim();
        const price = parseFloat(itemPriceInput.value);
        const quantity = parseInt(itemQuantityInput.value);
        if (name && !isNaN(price) && price >= 0 && !isNaN(quantity) && quantity >= 0) {
            centralStock = [...centralStock, { id: generateUUID(), name, price, quantity, image: selectedImage || null, fileName: selectedFileName || null }];
            saveData();
            renderAllStocks();
            itemNameInput.value = '';
            itemPriceInput.value = '';
            itemQuantityInput.value = '';
            itemImageInput.value = '';
            fileNameContainer.classList.add('hidden');
            imagePreview.classList.add('hidden');
            previewImage.src = '';
            fileNameSpan.textContent = '';
            selectedImage = null;
            selectedFileName = null;
            console.log('Item added:', { name, price, quantity, image: selectedImage, fileName: selectedFileName });
        } else {
            alert('Please fill in all fields with valid values.');
        }
    });

    // Edit item
    const editItem = (id, location, branchName) => {
        console.log('Editing item ID:', id, 'in location:', location, 'Branch:', branchName || 'central');
        const stock = location === 'central' ? centralStock : branchStocks[branchName];
        const item = stock.find(item => item.id === id);
        if (item) {
            const { name, price, quantity, image } = item;
            editNameInput.value = name;
            editPriceInput.value = price;
            editQuantityInput.value = quantity;
            editSelectedImage = image;
            if (image) {
                editPreviewImage.src = image;
                editImagePreview.classList.remove('hidden');
            } else {
                editImagePreview.classList.add('hidden');
                editPreviewImage.src = '';
            }
            editModal.classList.remove('hidden');

            confirmEditBtn.onclick = () => {
                const newName = editNameInput.value.trim();
                const newPrice = parseFloat(editPriceInput.value);
                const newQuantity = parseInt(editQuantityInput.value);
                if (newName && !isNaN(newPrice) && newPrice >= 0 && !isNaN(newQuantity) && newQuantity >= 0) {
                    const updatedStock = stock.map(i => i.id === id ? { ...i, name: newName, price: newPrice, quantity: newQuantity, image: editSelectedImage } : i);
                    if (location === 'central') centralStock = updatedStock;
                    else branchStocks[branchName] = updatedStock;
                    saveData();
                    renderAllStocks();
                    editModal.classList.add('hidden');
                    editImageInput.value = '';
                    editImagePreview.classList.add('hidden');
                    editPreviewImage.src = '';
                    editSelectedImage = null;
                    console.log('Item updated:', { id, name: newName, price: newPrice, quantity: newQuantity, image: editSelectedImage });
                } else {
                    alert('Invalid input. Please ensure all fields are valid.');
                }
            };
        } else {
            console.error('Item not found for ID:', id);
            alert('Item not found.');
        }
    };

    cancelEditBtn.addEventListener('click', () => {
        editModal.classList.add('hidden');
        editImageInput.value = '';
        editImagePreview.classList.add('hidden');
        editPreviewImage.src = '';
        editSelectedImage = null;
        console.log('Edit modal cancelled');
    });

    // Delete item
    const deleteItem = (id, location, branchName) => {
        console.log('Deleting item ID:', id, 'from location:', location, 'Branch:', branchName || 'central');
        if (confirm('Are you sure you want to delete this item?')) {
            if (location === 'central') {
                centralStock = [...centralStock.filter(item => item.id !== id)];
            } else {
                branchStocks[branchName] = [...branchStocks[branchName].filter(item => item.id !== id)];
            }
            saveData();
            renderAllStocks();
            console.log('Item deleted:', id);
        }
    };

    const openMoveModal = (id, from, to, branchName = null) => {
        console.log('Opening move modal for ID:', id, 'from:', from, 'to:', to, 'Branch:', branchName || 'central');
        const stock = from === 'central' ? centralStock : branchStocks[branchName];
        const item = stock.find(item => item.id === id);
        if (item) {
            const { name, quantity, price } = item;
            modalTitle.textContent = `Move ${name} from ${from === 'central' ? 'Central' : branchName} to ${to === 'central' ? 'Central' : to}`;
            modalStockInfo.textContent = `Available: ${quantity} units at Rp ${price.toLocaleString()} each`;
            moveQuantityInput.value = '';
            moveQuantityInput.max = quantity;
            totalPriceDisplay.textContent = '';
            moveModal.classList.remove('hidden');

            moveQuantityInput.addEventListener('input', () => {
                const qty = parseInt(moveQuantityInput.value);
                if (qty > 0 && qty <= quantity && !isNaN(qty)) {
                    totalPriceDisplay.textContent = `Total Price: Rp ${(qty * price).toLocaleString()}`;
                } else {
                    totalPriceDisplay.textContent = 'Invalid quantity';
                }
            });

            confirmMoveBtn.onclick = () => {
                const qty = parseInt(moveQuantityInput.value);
                if (qty > 0 && qty <= quantity && !isNaN(qty)) {
                    moveStock(id, from, to, qty, branchName);
                    moveModal.classList.add('hidden');
                    console.log('Stock moved:', { id, from, to, qty, branchName });
                } else {
                    alert('Please enter a valid quantity.');
                }
            };
        } else {
            console.error('Item not found for ID:', id);
            alert('Item not found.');
        }
    };

    // Move stock
    const moveStock = (id, from, to, quantity, branchName = null) => {
        console.log('Moving stock ID:', id, 'from:', from, 'to:', to, 'quantity:', quantity, 'Branch:', branchName || 'central');
        const fromStock = from === 'central' ? [...centralStock] : [...branchStocks[branchName]];
        const toStock = to === 'central' ? [...centralStock] : [...branchStocks[to]];
        const item = fromStock.find(item => item.id === id);
        if (item && quantity <= item.quantity) {
            const { name, price, image, fileName, ...rest } = item;
            item.quantity -= quantity;
            const existingItem = toStock.find(i => i.name === name && i.price === price);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                toStock.push({ id: generateUUID(), name, price, quantity, image, fileName, ...rest });
            }
            if (item.quantity === 0) {
                fromStock.splice(fromStock.findIndex(i => i.id === id), 1);
            }
            if (from === 'central') centralStock = fromStock;
            else branchStocks[branchName] = fromStock;
            if (to === 'central') centralStock = toStock;
            else branchStocks[to] = toStock;
            saveData();
            renderAllStocks();
            console.log('Stock updated:', { fromStock, toStock });
        } else {
            console.error('Invalid move operation:', { id, quantity, item });
            alert('Invalid move operation.');
        }
    };

    // Increment stock (from central to branch)
    const incrementStock = (id, location, branchName) => {
        console.log('Incrementing stock for ID:', id, 'in location:', location, 'Branch:', branchName);
        if (centralStock.length === 0) {
            alert('No items available in central stock to increment.');
            return;
        }
        const stock = branchStocks[branchName];
        const item = stock.find(item => item.id === id);
        if (!item) {
            console.error('Item not found for ID:', id);
            alert('Item not found.');
            return;
        }

        const modalContent = `
            <div id="selectItemModal" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center modal">
                <div class="section-container p-8 rounded-xl shadow-lg w-full max-w-sm">
                    <h2 class="text-xl font-semibold mb-4">Select Item to Move to ${branchName}</h2>
                    <select id="centralItemSelect" class="p-4 rounded-md w-full mb-4">
                        <option value="">Select an item</option>
                        ${centralStock.map(({ id, name, quantity, price, image }) => `<option value="${id}">${name} (Available: ${quantity}, Rp ${price.toLocaleString()})${image ? ' [Image]' : ''}</option>`).join('')}
                    </select>
                    <input id="moveQuantity" type="number" min="1" placeholder="Quantity to Move" class="p-4 rounded-md w-full mb-4">
                    <p id="totalPrice" class="mb-4"></p>
                    <div class="flex justify-end gap-4">
                        <button id="cancelSelectBtn" class="btn bg-[#2E2E2E] text-[#F5E8C7] px-4 py-2 rounded-md hover:bg-[#3F3F3F] transition">Cancel</button>
                        <button id="confirmSelectBtn" class="btn bg-[#D4A017] text-[#1C2526] px-4 py-2 rounded-md hover:bg-[#F5E8C7] transition">Move</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalContent);

        const selectItemModal = document.getElementById('selectItemModal');
        const centralItemSelect = document.getElementById('centralItemSelect');
        const moveQuantityInput = document.getElementById('moveQuantity');
        const totalPriceDisplay = document.getElementById('totalPrice');
        const cancelSelectBtn = document.getElementById('cancelSelectBtn');
        const confirmSelectBtn = document.getElementById('confirmSelectBtn');

        centralItemSelect.addEventListener('change', () => {
            const selectedId = centralItemSelect.value;
            const selectedItem = centralStock.find(item => item.id === selectedId);
            if (selectedItem) {
                const { quantity, price } = selectedItem;
                moveQuantityInput.max = quantity;
                moveQuantityInput.addEventListener('input', () => {
                    const qty = parseInt(moveQuantityInput.value);
                    if (qty > 0 && qty <= quantity && !isNaN(qty)) {
                        totalPriceDisplay.textContent = `Total Price: Rp ${(qty * price).toLocaleString()}`;
                    } else {
                        totalPriceDisplay.textContent = 'Invalid quantity';
                    }
                });
            }
        });

        confirmSelectBtn.addEventListener('click', () => {
            const selectedId = centralItemSelect.value;
            const qty = parseInt(moveQuantityInput.value);
            if (selectedId && qty > 0 && qty <= centralStock.find(item => item.id === selectedId).quantity) {
                moveStock(selectedId, 'central', branchName, qty);
                selectItemModal.remove();
                console.log('Stock incremented:', { selectedId, branchName, qty });
            } else {
                alert('Please select an item and enter a valid quantity.');
            }
        });

        cancelSelectBtn.addEventListener('click', () => {
            selectItemModal.remove();
            console.log('Increment modal cancelled');
        });
    };

    // Decrement stock
    const decrementStock = (id, location, branchName) => {
        console.log('Decrementing stock for ID:', id, 'in location:', location, 'Branch:', branchName);
        const stock = branchStocks[branchName];
        const item = stock.find(item => item.id === id);
        if (item && item.quantity > 0) {
            const { quantity } = item;
            item.quantity = quantity - 1;
            if (item.quantity === 0) {
                stock.splice(stock.findIndex(i => i.id === id), 1);
            }
            branchStocks[branchName] = stock;
            saveData();
            renderAllStocks();
            console.log('Stock decremented:', item);
        } else {
            console.error('Cannot decrement item:', id);
            alert('Cannot decrement: Item not found or quantity is 0.');
        }
    };

    // Cancel move
    cancelMoveBtn.addEventListener('click', () => {
        moveModal.classList.add('hidden');
        console.log('Move modal cancelled');
    });

    renderAllStocks();