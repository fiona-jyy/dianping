// pages/menu/menu.js
Page({
  data: {
    restaurantId: null,
    currentUser: null,
    meals: []
  },
  onLoad: function (options) {
    this.setData({
      restaurantId: options.id
    })
    //获取当前用户
    let page = this
    wx.BaaS.auth.getCurrentUser().then(function (res) {
      page.setData({
        currentUser: res
      })
    })
    this.fetchMeals()
  },

  fetchMeals: function () {
    let restaurantId = this.data.restaurantId
    let Meal = new wx.BaaS.TableObject('meals')
    let query = new wx.BaaS.Query()
    query.compare('restaurant_id', '=', restaurantId)
    let page = this
    Meal.setQuery(query).find().then(function (res) {
      page.setData({
        meals: res.data.objects
      })
    })
  },

  onSubmitOrder: function (event) {
    console.log(event)
    let mealId = event.currentTarget.dataset.id
    let Order = new wx.BaaS.TableObject('orders')
    let order = Order.create()
    order.set({
      user_id: this.data.currentUser.id.toString(),
      meal_id: mealId,
      quantity: 1
    })
    order.save().then(function (res) {
      wx.showModal({
        title: '订单创建成功',
        content: '请前往个人中心查看'
      })
    }).catch(function (err) {
      wx.showModal({
        title: '订单创建失败',
        content: err.message
      })
    })
  },

  gotoReviews:function(){
    let restaurantId = this.data.restaurantId
    wx.navigateTo({
      url: '/pages/show/show?id=' + restaurantId
    })

  }
})