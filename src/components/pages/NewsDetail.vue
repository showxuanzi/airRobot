<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-lx-calendar"></i> 新闻动态</el-breadcrumb-item>
                <el-breadcrumb-item>新闻详情</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container"  v-loading="loading" 
                element-loading-text="图片上传中，请稍等"
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(0, 0, 0, 0.6)">
            <el-form ref="form" :model="form" :rules="rules" label-width="80px" class="news-form">
                <el-form-item label="新闻标题" prop="title">
                    <el-input v-model="form.title"></el-input>
                </el-form-item>
                <el-form-item label="创建时间" prop="createtime">
                     <el-date-picker
                        v-model="form.createtime"
                        type="datetime"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        placeholder="选择创建时间"
                        default-time="12:00:00">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="新闻分类" prop="type">
                    <el-select placeholder="请选择" v-model="form.type">
                        <el-option
                          v-for="item in selectOptions"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="新闻摘要" prop="keyword">
                    <el-input type="textarea" v-model="form.keyword"></el-input>
                </el-form-item> 
                <el-form-item label="封面图片" prop="imgpath">
                    <div class="crop-demo">
                        <img :src="cropImg" class="pre-img" v-show="cropImg">
                        <div class="crop-demo-btn">选择图片
                            <input class="crop-input" type="file" name="file" accept="image/*" @change="setImage"/>
                        </div>
                    </div>
                </el-form-item>
                <!-- 图片上传组件辅助-->
                <el-upload v-show="false"
                        class="avatar-uploader"
                        :action="serverUrl"
                        name="file"
                        accept=".jpg,.jpeg,.png,.gif,.bmp,.JPG,.JPEG,.PBG,.GIF,.BMP"
                        :show-file-list="false"
                        :on-success="uploadSuccess"
                        :on-error="uploadError"
                        :before-upload="beforeUpload"
                        >
                </el-upload>
                <!-- 图片上传组件辅助-->
                 <el-form-item label="新闻内容" prop="content">
                    <quill-editor 
                        ref="myTextEditor" 
                        v-model="content" 
                        :options="editorOption"
                        @change="onEditorChange($event)"
                        @ready="onEditorReady($event)"
                    ></quill-editor>
                </el-form-item>
                <el-button class="editor-btn" type="primary" @click="submit('form')">保存编辑</el-button>
            </el-form> 
        </div>
    </div>
</template>

<script>
    import 'quill/dist/quill.core.css';
    import 'quill/dist/quill.snow.css';
    import 'quill/dist/quill.bubble.css';
    import { quillEditor } from 'vue-quill-editor';
    import Qs from 'qs';
    // 工具栏配置
    const toolbarOptions = [
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      ['blockquote', 'code-block'],

      [{'header': 1}, {'header': 2}],               // custom button values
      [{'list': 'ordered'}, {'list': 'bullet'}],
      [{'script': 'sub'}, {'script': 'super'}],      // superscript/subscript
      [{'indent': '-1'}, {'indent': '+1'}],          // outdent/indent
      [{'direction': 'rtl'}],                         // text direction

      [{'size': ['small', false, 'large', 'huge']}],  // custom dropdown
      [{'header': [1, 2, 3, 4, 5, 6, false]}],

      [{'color': []}, {'background': []}],          // dropdown with defaults from theme
      [{'font': []}],
      [{'align': []}],
      ['link', 'image', 'video'],
      ['clean']                                         // remove formatting button
    ]
    export default {
        name: 'newsdetail',
        data: function(){
            return {
                form:{
                    title:"",
                    type: "",
                    imgpath: "",
                    content: "",
                    keyword: "",
                    createtime:""
                },
                rules: {
                    title: [
                        { required: true, message: '请输入新闻标题', trigger: 'blur' }
                    ],
                    createtime: [
                        { required: true, message: '请选择创建时间', trigger: 'blur' }
                    ],
                    type: [
                        { required: true, message: '请选择新闻分类', trigger: 'change' }
                    ],
                    keyword: [
                        { required: true, message: '请输入新闻摘要', trigger: 'blur' }
                    ],
                    imgpath: [
                        { required: true, message: '请上传封面图片', trigger: 'change' }
                    ],
                    content: [
                        { required: true, message: '请输入新闻内容', trigger: 'blur' }
                    ]
                },
                selectOptions: [{
                    value: '赛事动态',
                    label: '赛事动态'
                },{
                    value: '前沿科技',
                    label: '前沿科技'
                }],
                defaultSrc: './static/img/img.jpg',
                globalServerUrl: "",
                cropImg: '',
                newsId: 0,
                loading: false,
                quillUpdateImg: false, // 根据图片上传状态来确定是否显示loading动画，刚开始是false,不显示
                serverUrl: '',  // 上传的图片服务器地址
                content: '',
                editorOption: {
                    placeholder: 'Hello World',
                    theme: 'snow',  // or 'bubble'
                    modules: {
                        toolbar: {
                            container: toolbarOptions,  // 工具栏
                            handlers: {
                                'image': function (value) {
                                    if (value) {
                                        // 触发input框选择图片文件
                                        document.querySelector('.avatar-uploader input').click();
                                    } else {
                                        this.quill.format('image', false);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        components: {
            quillEditor
        },
        created(){
            this.newsId = this.$route.query.id;
            this.serverUrl = globalServerUrl + "/activity/fileupload.do";
            this.getData();
        },
        methods: {
            getData(){
                this.$axios.post(globalServerUrl+"/news/editnews.do",Qs.stringify({
                    id: this.newsId
                })).then((res)=>{
                    this.form = res.data;
                    this.cropImg = this.form.imgpath;
                    this.content =  this.form.content;
                    this.$axios.post(globalServerUrl+this.form.content).then((res)=>{
                        this.content = res.data;
                    })
                })
            },
            onEditorChange({ editor, html, text }) {
                this.content = html;
            },
            submit(formName){
                this.form.content = this.content;
                this.$set(this.form,"createuserid",1);
                this.$set(this.form,"id",this.newsId);
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.$axios.post(globalServerUrl+"/news/editnewssave.do",Qs.stringify(this.form)
                        ).then((res)=>{
                            if(res.data == 1){
                                this.$message.success('修改成功！');
                                this.$router.push('/news');
                            }else if(res.data == 2){
                                this.$message.error("修改失败！");
                            }
                        })
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
           // 富文本图片上传前
            beforeUpload(file) {
                // 显示loading动画
                this.loading = true;
                const isJPG = file.type === 'image/jpeg';
                const isLt1M = file.size / 1024 / 1024 < 1;
                // if (!isJPG) {
                //   this.$message.error('上传头像图片只能是 JPG 格式!');
                // }
                if (!isLt1M) {
                  this.$message.error('上传图片大小不能超过 1MB!');
                  this.loading = false;
                }
                // return isJPG && isLt1M;
                return isLt1M;
            },
            uploadSuccess(res, file) {
                // res为图片服务器返回的数据
                // 获取富文本组件实例
                let quill = this.$refs.myTextEditor.quill;
                // 如果上传成功
                if(res){
                    // 获取光标所在位置
                    let length = quill.getSelection().index;
                     // 插入图片  res为服务器返回的图片地址
                    quill.insertEmbed(length, 'image', globalServerUrl+res);
                    // 调整光标到最后
                    quill.setSelection(length + 1);
                }else{
                    this.$message.error('图片插入失败');
                }
                // loading动画消失
                this.loading = false;
            },
            // 富文本图片上传失败
            uploadError() {
                // loading动画消失
                this.quillUpdateImg = false
                this.$message.error('图片插入失败')
            },
            //文件上传成功的钩子函数
            handleSuccess(res, file) {
                this.$message({
                    type: 'success',
                    message: '图片上传成功',
                    duration: 6000
                });
                if(res){
                    this.form.imgpath = globalServerUrl + res;
                }
            },
            setImage(e){
                this.loading = true;
                const file = e.target.files[0];
                if (!file.type.includes('image/')) {
                    return;
                }
                let formData = new FormData();
                formData.append("file",file);
                this.$axios.post(globalServerUrl+"/activity/fileupload.do",
                    formData,
                ).then((res)=>{
                    this.loading = false;
                    this.cropImg = globalServerUrl + res.data;
                    this.form.imgpath = globalServerUrl + res.data;
                })
            },
        }
    }
</script>
<style scoped>
    .editor-btn.el-button--primary{
        margin-top: 20px;
        display: block;
        margin: 0 auto;
    }
    .el-input.el-input--small{
        width: 400px;
    }
    .el-textarea.el-input--small{
        width: 400px;
    }
    .content-title{
        font-weight: 400;
        line-height: 50px;
        margin: 10px 0;
        font-size: 22px;
        color: #1f2f3d;
    }
    .pre-img{   
        width: auto;
        height: 100px;
        background: #f8f8f8;
        border: 1px solid #eee;
        border-radius: 5px;
    }
    .crop-demo{
        display: flex;
        align-items: flex-end;
    }
    .crop-demo-btn{
        position: relative;
        width: 100px;
        height: 30px;
        line-height: 30px;
        padding: 0 20px;
        margin-left: 30px;
        background-color: #fa820c;
        color: #fff;
        font-size: 12px;
        border-radius: 4px;
        box-sizing: border-box;
        bottom: 50%;
    }
    .crop-input{
        position: absolute;
        width: 100px;
        height: 40px;
        left: 0;
        top: 0;
        opacity: 0;
        cursor: pointer;
    }

</style>
<style>
    .el-upload-list--picture-card .el-upload-list__item{
        width: 200px;
    }
    .el-upload-list--picture-card .el-upload-list__item .el-upload-list__item-thumbnail{
        width: 100%;
        height: auto;
    }
</style>