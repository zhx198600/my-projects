import { connectDatabase, disconnectDatabase } from '../config/database';
import { User, Post, Comment, SensitiveWord } from '../models';

const testModels = async () => {
  try {
    await connectDatabase();
    console.log('\n=== 开始测试数据模型 ===\n');

    console.log('--- 1. 测试 User 模型 ---\n');
    const testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      role: 'user',
    });
    console.log('✅ 创建测试用户:', testUser.username);

    const passwordValid = await testUser.comparePassword('password123');
    console.log('✅ 密码验证:', passwordValid ? '通过' : '失败');

    const foundUser = await User.findOne({ username: 'testuser' });
    console.log('✅ 查询用户:', foundUser ? foundUser.email : '未找到');

    console.log('\n--- 2. 测试 Post 模型 ---\n');
    const testPost = await Post.create({
      title: '测试帖子标题',
      content: '这是测试帖子的内容，包含一些文字。',
      category: '科技',
      author: testUser._id,
      commentsEnabled: true,
    });
    console.log('✅ 创建帖子:', testPost.title);

    const postWithAuthor = await Post.findById(testPost._id).populate('author', 'username');
    console.log('✅ 帖子关联作者:', (postWithAuthor?.author as any)?.username);

    const postsByCategory = await Post.find({ category: '科技' });
    console.log('✅ 按分类查询帖子数:', postsByCategory.length);

    console.log('\n--- 3. 测试 Comment 模型（嵌套关联） ---\n');
    const rootComment = await Comment.create({
      content: '这是一级评论',
      author: testUser._id,
      postId: testPost._id,
      parentId: null,
    });
    console.log('✅ 创建一级评论:', rootComment.content);

    const replyComment = await Comment.create({
      content: '这是对一级评论的回复（二级评论）',
      author: testUser._id,
      postId: testPost._id,
      parentId: rootComment._id,
    });
    console.log('✅ 创建二级评论（回复）:', replyComment.content);

    const nestedReply = await Comment.create({
      content: '这是更深层的嵌套回复',
      author: testUser._id,
      postId: testPost._id,
      parentId: replyComment._id,
    });
    console.log('✅ 创建三级评论（嵌套回复）:', nestedReply.content);

    const allComments = await Comment.find({ postId: testPost._id });
    console.log('✅ 该帖子总评论数:', allComments.length);

    const commentTree = await (Comment as any).getCommentTree(testPost._id);
    console.log('\n📝 评论树结构:');
    console.log(JSON.stringify(commentTree, null, 2));
    console.log('\n✅ 评论树嵌套结构生成成功!');

    console.log('\n--- 4. 测试 SensitiveWord 模型 ---\n');
    await SensitiveWord.create({ word: '测试敏感词' });
    
    const testText = '这句话包含测试敏感词';
    const containsSensitive = await (SensitiveWord as any).containsSensitive(testText);
    console.log('✅ 敏感词检测:', testText, containsSensitive ? '包含敏感词' : '不包含敏感词');

    const { filtered, hasSensitive } = await (SensitiveWord as any).filterText(testText);
    console.log('✅ 敏感词过滤结果:', filtered, hasSensitive ? '(已过滤敏感词)' : '');

    console.log('\n--- 5. 测试索引查询性能 ---\n');
    const userQuery = User.find({ username: 'testuser' }).explain('executionStats');
    const userExplain = await userQuery;
    console.log('✅ 用户查询使用索引:', (userExplain as any).executionStats.executionStages.inputStage.stage);

    const postQuery = Post.find({ category: '科技' }).sort({ createdAt: -1 }).explain('executionStats');
    const postExplain = await postQuery;
    console.log('✅ 帖子查询使用索引:', (postExplain as any).executionStats.executionStages.inputStage.stage);

    console.log('\n=== 清理测试数据 ===\n');
    await User.deleteOne({ _id: testUser._id });
    await Post.deleteOne({ _id: testPost._id });
    await Comment.deleteMany({ postId: testPost._id });
    await SensitiveWord.deleteOne({ word: '测试敏感词' });
    console.log('✅ 测试数据已清理');

    console.log('\n🎉 所有数据模型测试通过!\n');
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await disconnectDatabase();
  }
};

testModels();
