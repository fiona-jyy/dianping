// pages/order/order.js
Page({

  data: {
    order:[]
  },

  onLoad: function (options) {
    let tableName = 'orders'
    let Order = new wx.BaaS.TableObject(tableName)
    let page = this
    Order.expand(['meal_id']).find().then(function(res) {
      page.setData({
        orders:res.data.objects
      })
    })
  }
})