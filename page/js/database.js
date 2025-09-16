/**
 * IndexedDB数据库操作模块
 * 用于存贷组合产品测算器的数据持久化
 */

class ProductDatabase {
    constructor() {
        this.dbName = 'ProductCalculatorDB';
        this.dbVersion = 1;
        this.storeName = 'products';
        this.db = null;
    }

    /**
     * 初始化数据库
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                reject(new Error('数据库打开失败'));
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // 创建产品存储对象
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    
                    // 创建索引
                    store.createIndex('type', 'type', { unique: false });
                    store.createIndex('createTime', 'createTime', { unique: false });
                }
            };
        });
    }

    /**
     * 添加产品
     */
    async addProduct(productData) {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            // 添加创建时间和更新时间
            const product = {
                ...productData,
                createTime: Date.now(),
                updateTime: Date.now()
            };

            const request = store.add(product);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error('添加产品失败'));
            };
        });
    }

    /**
     * 获取所有产品
     */
    async getAllProducts() {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                // 按创建时间排序（从旧到新）
                const products = request.result.sort((a, b) => a.createTime - b.createTime);
                resolve(products);
            };

            request.onerror = () => {
                reject(new Error('获取产品列表失败'));
            };
        });
    }

    /**
     * 根据ID获取产品
     */
    async getProductById(id) {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error('获取产品失败'));
            };
        });
    }

    /**
     * 更新产品
     */
    async updateProduct(id, productData) {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            // 先获取原产品数据
            const getRequest = store.get(id);
            
            getRequest.onsuccess = () => {
                const originalProduct = getRequest.result;
                if (!originalProduct) {
                    reject(new Error('产品不存在'));
                    return;
                }

                // 更新产品数据，保留创建时间
                const updatedProduct = {
                    ...originalProduct,
                    ...productData,
                    updateTime: Date.now()
                };

                const updateRequest = store.put(updatedProduct);

                updateRequest.onsuccess = () => {
                    resolve(updateRequest.result);
                };

                updateRequest.onerror = () => {
                    reject(new Error('更新产品失败'));
                };
            };

            getRequest.onerror = () => {
                reject(new Error('获取产品失败'));
            };
        });
    }

    /**
     * 删除产品
     */
    async deleteProduct(id) {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve(true);
            };

            request.onerror = () => {
                reject(new Error('删除产品失败'));
            };
        });
    }

    /**
     * 清空所有产品
     */
    async clearAllProducts() {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();

            request.onsuccess = () => {
                resolve(true);
            };

            request.onerror = () => {
                reject(new Error('清空产品失败'));
            };
        });
    }

    /**
     * 获取产品数量
     */
    async getProductCount() {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.count();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error('获取产品数量失败'));
            };
        });
    }
}

// 创建全局数据库实例
window.productDB = new ProductDatabase();
