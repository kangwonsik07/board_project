const express = require('express')
const { isLoggedIn } = require('./middlewares')
const { Post, User, Board } = require('../models/')
const router = express.Router()

router.post('/create', isLoggedIn, async (req, res) => {
   try {
      const post = await Post.create({
         title: req.body.title,
         content: req.body.content,
         UserId: req.user.id,
         BoardId: req.board.id,
      })

      res.json({
         success: true,
         post: {
            title: post.title,
            content: post.content,
            UserId: post.UserId,
            BoardId: post.BoardId,
         },
         message: '게시물이 등록되었습니다',
      })
   } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, message: '게시물 등록 중 오류 발생', error })
   }
})

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
         succcess: true,
         post: updatePost,
         message: '게시물이 성공적으로 수정되었습니다.',
      })
   } catch (error) {
      console.error(error)
      res.status(500).json({ succcess: false, message: '게시물 수정 중 오류 발생', error })
   }
})

router.delete('/:id', isLoggedIn, async (req, res) => {
   try {
      const post = await Post.findOne({ where: { id: req.params.id, UserId: req.params.id } })
      if (!post) {
         return res.status(404).json({ success: false, message: '게시물을 찾을 수 없습니다.' })
      }

      await post.destroy()

      res.json({
         succcess: true,
         message: '게시물이 삭제 되었습니다',
      })
   } catch (error) {
      console.error(error)
      res.status(500).json({ succcess: false, message: '게시물 삭제 중 오류 발생', error })
   }
})

module.exports = router
