Page({
  data: {
    carts: [],
    currentUser: null,
    totalPrice: 0,
    products: []
  },
  onLoad: function () {
    this.fetchProducts()
    let page = this
    wx.BaaS.auth.getCurrentUser().then(function (res) {
      page.setData({
        currentUser: res
      })
    })
  },
  fetchProducts: function () {
    let Product = new wx.BaaS.TableObject('products')
    let page = this
    Product.find().then(function (res) {
      page.setData({
        products: res.data.objects
      })
      page.fetchCarts()
    })
  },
  fetchCarts: function () {
    let Cart = new wx.BaaS.TableObject('carts')
    let page = this
    Cart.find().then(function (res) {
      page.setData({
        carts: res.data.objects
      })
      //把carts数据合并到products中
      let carts = page.data.carts
      page.data.products.forEach(function (product) {
        let cart = carts.find((cart) => cart.product.id == product.id)
        if (cart) {
          product.quantity = cart.quantity
          product.cart_id = cart.id
        } else {
          // product不在购物车里，什么都不做
        }
      })
      page.setData({
        products: page.data.products
      })
    })
  },
  onAdd: function (event) {
    let productId = event.currentTarget.dataset.id
    let product = this.data.products.find((product) => product.id == productId)
    if (product.quantity) {
      product.quantity += 1
    } else {
      product.quantity = 1
    }
    this.setData({
      products: this.data.products
    })
    this.addToCart(product,product.quantity)
    this.updateTotalPrice()
  },

  onMinus: function (event) {
    let productId = event.currentTarget.dataset.id
    let product = this.data.products.find((product) => product.id == productId)
    if (product.quantity) {
      product.quantity -= 1
    } else {
      product.quantity = 0
    }
    this.setData({
      products: this.data.products
    })
    this.addToCart(product, product.quantity)
    this.updateTotalPrice()
  },

  updateTotalPrice: function () {
    // let totalPrice = this.data.products.reduce((sum,product)=>{
    //   let price = product.price * (product.quantity||0)
    //   return sum + price
    // }, 0)
    let totalPrice = 0
    this.data.products.forEach(function (product) {
      let price = product.quantity ? product.price * product.quantity : 0
      totalPrice += price
    })
    this.setData({
      totalPrice: totalPrice
    })
  },
  addToCart: function (product, quantity) {
    let Cart = new wx.BaaS.TableObject('carts')
    if (quantity <= 0 && product.cart_id) {
      //应该删除购物车
      Cart.delete(product.cart_id).then(function () {
        delete product.cart_id
        wx.showToast({ title: '删除购物车成功' })
      })
      return
    }
    if (quantity <= 0) {
      //product 没有添加过购物车，同时quantity是0，什么也不干
      return
    }
    let cart
    if (product.cart_id) {
      cart = Cart.getWithoutData(product.cart_id)
      cart.set({
        quantity: quantity
      })
      cart.update().then(function () {
        wx.showToast({
          title: '更新购物车成功'
        })
      })
    } else {
      cart = Cart.create()
      cart.set({
        user: this.data.currentUser.id.toString(),
        product: product.id,
        quantity: quantity,
        price: product.price * quantity
      })
      cart.save().then(function (res) {
        //新建购物车以后，把cart id记录在product上，方便下次更新
        product.cart_id = res.data.id
        wx.showToast({
          title: '添加购物车成功'
        })
      })
    }

  }
})
