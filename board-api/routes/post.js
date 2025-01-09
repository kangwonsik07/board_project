const express = require('express')
const { isLoggedIn } = require('./middlewares')
const { Post, User, Board } = require('../models/')
const router = express.Router()

// 게시물 작성
router.post('/create', isLoggedIn, async (req, res) => {
   try {
      const post = await Post.create({
         title: req.body.title,
         content: req.body.content,
         UserId: req.user.id,
         // BoardId: req.board.id,
         like: req.body.like,
         view: req.body.view,
      })

      res.json({
         success: true,
         post: {
            title: post.title,
            content: post.content,
            UserId: post.UserId,
            // BoardId: post.BoardId,
            like: post.like,
            view: post.view,
         },
         message: '게시물이 등록되었습니다',
      })
   } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, message: '게시물 등록 중 오류 발생', error })
   }
})

// 수정
router.put('/:id', isLoggedIn, async (req, res) => {
   try {
      const post = await Post.findOne({ where: { id: req.params.id, UserId: req.user.id } })

      if (!post) {
         return res.status(404).json({ success: false, message: '게시물을 찾을 수 없습니다.' })
      }

      await post.update({
         title: req.body.title,
         content: req.body.content,
      })

      const updatePost = await Post.findOne({
         where: { id: req.params.id },
         include: [
            {
               model: User,
               attributes: ['id', 'nick'],
            },
         ],
      })

      res.json({
         success: true,
         post: updatePost,
         message: '게시물이 성공적으로 수정되었습니다.',
      })
   } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, message: '게시물 수정 중 오류 발생', error })
   }
})

// 삭제
router.delete('/:id', isLoggedIn, async (req, res) => {
   try {
      const post = await Post.findOne({ where: { id: req.params.id, UserId: req.params.id } })
      if (!post) {
         return res.status(404).json({ success: false, message: '게시물을 찾을 수 없습니다.' })
      }

      await post.destroy()

      res.json({
         success: true,
         message: '게시물이 삭제 되었습니다',
      })
   } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, message: '게시물 삭제 중 오류 발생', error })
   }
})

// 게시물 불러오기
router.get('/', async (req, res) => {
   try {
      const page = parseInt(req.query.page, 10) || 1
      const limit = parseInt(req.query.limit, 15) || 10
      const offset = (page - 1) * limit

      const count = await Post.count()

      const posts = await Post.findAll({
         limit,
         offset,
         order: [['createdAt', 'DESC']],
         include: [
            {
               model: User,
               attributes: ['id', 'nick', 'email'],
            },
         ],
      })

      res.json({
         success: true,
         posts,
         pagination: {
            totalPosts: count,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            limit,
         },
         message: '전체 게시물 리스트를 성공적으로 불러왔습니다',
      })
   } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, message: '게시물 리스트를 불러오는 중 오류가 발생했습니다.', error })
   }
})

module.exports = router
