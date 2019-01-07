<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-lx-calendar"></i> 新闻动态</el-breadcrumb-item>
                <el-breadcrumb-item>新闻详情</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <el-form ref="form" :model="form" label-width="80px" class="news-form">
                <el-form-item label="新闻标题">
                    <el-input v-model="form.title"></el-input>
                </el-form-item>
                <el-form-item label="新闻分类">
                    <el-select placeholder="请选择" v-model="form.type">
                        <el-option
                          v-for="item in selectOptions"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="封面图片">
                    <div class="crop-demo">
                        <img :src="cropImg" class="pre-img">
                        <div class="crop-demo-btn">选择图片
                            <input class="crop-input" type="file" name="file" accept="image/*" @change="setImage"/>
                        </div>
                    </div>
                </el-form-item>
            </el-form> 
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
            <quill-editor 
                ref="myTextEditor" 
                v-model="content" 
                :options="editorOption"
                @change="onEditorChange($event)"
                @ready="onEditorReady($event)"
            ></quill-editor>
            <el-button class="editor-btn" type="primary" @click="submit">提交</el-button>
        </div>
    </div>
</template>

<script>
    import 'quill/dist/quill.core.css';
    import 'quill/dist/quill.snow.css';
    import 'quill/dist/quill.bubble.css';
    import { quillEditor } from 'vue-quill-editor';
    import VueCropper  from 'vue-cropperjs';
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
        name: 'editor',
        data: function(){
            return {
                form:{
                    title:"",
                    type: "",
                    imgpath: "",
                    content: ""
                },
                selectOptions: [{
                    value: '分类1',
                    label: '分类1'
                },{
                    value: '分类2',
                    label: '分类2'
                },{
                    value: '分类3',
                    label: '分类3'
                },{
                    value: '分类4',
                    label: '分类4'
                }],
                defaultSrc: './static/img/img.jpg',
                globalServerUrl: "http://192.168.1.118:8080",
                cropImg: '',
                newsId: 0,
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
            // console.log(this.$route.query.id);
            this.serverUrl = this.globalServerUrl + "/activity/fileupload.do";
        },
        mounted(){
            this.$axios.post(" https://www.easy-mock.com/mock/5c2d7a9e410de05f5d0de700/xmx/newsDetail",{
                id: 1
            }).then((res)=>{
                this.form = res.data.data;
                this.cropImg = this.form.imgpath;
            })
        },
        methods: {
            onEditorChange({ editor, html, text }) {
                this.content = html;
            },
            onEditorReady(event){

            },
            submit(){
                this.form.content = this.content;
                this.$set(this.form,"createuserid",1);
                this.$axios.post(this.globalServerUrl+"/news/addnews.do",Qs.stringify(this.form)
                ).then((res)=>{
                    // console.log(res.data);
                    if(res.data == 1){
                        this.$message.success('提交成功！');
                    }
                })
            },
           // 富文本图片上传前
            beforeUpload(file) {
                // 显示loading动画
                this.quillUpdateImg = true;
                const isJPG = file.type === 'image/jpeg';
                const isLt1M = file.size / 1024 / 1024 < 1;
                // if (!isJPG) {
                //   this.$message.error('上传头像图片只能是 JPG 格式!');
                // }
                if (!isLt1M) {
                  this.$message.error('上传图片大小不能超过 1MB!');
                }
                // return isJPG && isLt1M;
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
                    quill.insertEmbed(length, 'image', this.globalServerUrl+res);
                    // 调整光标到最后
                    quill.setSelection(length + 1);
                }else{
                    this.$message.error('图片插入失败');
                }
                // loading动画消失
                this.quillUpdateImg = false
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
                    this.form.imgpath = this.globalServerUrl + res;
                }
            },
            setImage(e){
                const file = e.target.files[0];
                if (!file.type.includes('image/')) {
                    return;
                }
                let formData = new FormData();
                formData.append("file",file);
                this.$axios.post(this.globalServerUrl+"/activity/fileupload.do",
                    formData,
                ).then((res)=>{
                    this.cropImg = this.globalServerUrl + res.data;
                    this.form.imgpath = this.globalServerUrl + res.data;
                })
            },
        }
    }
</script>
<style scoped>
    .editor-btn{
        margin-top: 20px;
    }
    .el-input.el-input--small{
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