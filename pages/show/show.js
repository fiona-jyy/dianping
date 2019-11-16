Page({
  data:{
    currentUser: null,
    restaurantId:null,
    restaurant:{},
    reviews:[],
    ratingValues:[1,2,3,4,5],
    rating:5
  },
  onLoad:function(options){
    //在页面上保存restaurantId 便于其他function使用
    this.setData({
      restaurantId: options.id
    })

    let restaurantId = this.data.restaurantId
    
    //获取餐厅详情
    let Restaurant = new wx.BaaS.TableObject('restaurants')
    let page = this
    Restaurant.get(restaurantId).then(function(res){
      page.setData({
        restaurant:res.data
      })
    })
    //获取餐厅评论
    this.fetchReviews()
    //获取当前用户
    wx.BaaS.auth.getCurrentUser().then(function (res) {
      page.setData({
        currentUser: res
      })
    })
  },
  fetchReviews:function(){
    let restaurantId = this.data.restaurantId
    let Review = new wx.BaaS.TableObject('reviews')
    let query = new wx.BaaS.Query()
    query.compare('restaurant_id','=',restaurantId)
    let page = this
    Review.setQuery(query).find().then(function(res){
      page.setData({
        reviews:res.data.objects
      })
    })
  },
  onChangeRating:function(event){
    let index = event.detail.value
    let rating = this.data.ratingValues[index]
    this.setData({
      rating:rating
    })
  },
  onSubmitReview:function(event){
    let content = event.detail.value.content
    let rating = this.data.rating
    let Review = new wx.BaaS.TableObject('reviews')
    let review = Review.create()

    review.set({
      user_id:this.data.currentUser.id.toString(),
      restaurant_id:this.data.restaurantId,
      content:content,
      rating:rating
    })

    let page=this
    review.save().then(function(res){
      page.fetchReviews()
    })
  }
})