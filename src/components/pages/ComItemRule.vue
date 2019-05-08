<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-lx-calendar"></i> 竞赛活动</el-breadcrumb-item>
                <el-breadcrumb-item>{{heading}}</el-breadcrumb-item>
                <el-breadcrumb-item>{{nextHeading}}</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-button type="primary" icon="delete" class="handle-del mr10" @click="handleAdd()">添加比赛规则</el-button>
            </div>
            <el-table :data="tableData" border class="table">
                <el-table-column label="规则名称" align="center" prop="title"></el-table-column>
                <!-- <el-table-column prop="order" label="顺序" width="100" align="center"></el-table-column> -->
                <el-table-column prop="createtime" label="上传时间" width="200" align="center"></el-table-column>
                <el-table-column label="操作" width="200" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button type="text" icon="el-icon-delete" class="blue" @click="handleDelete(scope.row.id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
             <div class="pagination" v-show="totalNumber>0">
                <el-pagination background @current-change="handleCurrentChange" layout="prev, pager, next" :total="totalNumber"></el-pagination>
            </div>
        </div>
        <!-- 编辑弹出框 -->
        <el-dialog :title="dialogTitle" :visible.sync="addVisible" width="50%" v-loading="loading" 
                element-loading-text="图片上传中，请稍等"
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(0, 0, 0, 0.6)">
            <el-form ref="form" :model="form" :rules="rules" label-width="100px" >
               <el-form-item label="规则名称" prop="title">
                    <el-input v-model="form.title"></el-input>
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
                        :before-upload="beforeUpload">
                </el-upload>
                <!-- 图片上传组件辅助-->
                 <el-form-item label="规则内容" prop="content">
                    <quill-editor 
                        ref="myTextEditor" 
                        v-model="content" 
                        :options="editorOption"
                        @change="onEditorChange($event)"
                        @ready="onEditorReady($event)"
                    ></quill-editor>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addVisible = false">取 消</el-button>
                <el-button type="primary" @click="addSave('form')">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 删除提示框 -->
        <el-dialog title="提示" :visible.sync="delVisible" width="300px" center>
            <div class="del-dialog-cnt">删除不可恢复，是否确定删除？</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="delVisible = false">取 消</el-button>
                <el-button type="primary" @click="deleteRow">确 定</el-button>
            </span>
        </el-dialog>
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
        name: 'comitemrule',
        data: function(){
            return {
                heading: "",
                nextHeading: "",
                dialogTitle: "添加比赛规则",
                tableData: [],
                addVisible: false,   // 添加弹框是否显示
                delVisible: false,   //删除弹框是否显示
                form: {
                    title: '',
                    content: ''
                },
                rules:{
                    title:[
                        { required: true, message: '请输入规则名称', trigger: 'blur' }
                    ],
                    content:[
                        { required: true, message: '请输入规则内容', trigger: 'blur' }
                    ]
                },
                //服务器地址
                cropImg:"",
                cur_page: 1,   //当前页
                totalNumber: 1,  //列表总条数
                comId: 0, //项目id
                serverUrl: '',  // 上传的图片服务器地址
                content: '',
                loading: false,
                ruleId: 0,
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
        methods:{
            // 初始化表格数据
            getData() {
                this.$axios.post(globalServerUrl+"/competition/comruleList.do",Qs.stringify({
                    comId: this.comId,
                    page: this.cur_page,
                    limit: 10
                })
                ).then((res) => {
                    console.log(res)
                    this.tableData = res.data.data;
                    this.totalNumber = res.data.count;
                })
            },
            // 添加竞赛名称
            addSave(formName) {
                this.form.content = this.content;
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        if(this.dialogTitle === "添加比赛规则"){
                            this.$set(this.form,"comid",this.comId);
                            if(this.form.id === undefined){
                            }else{
                                this.$delete(this.form,"id");
                            }
                            this.$axios.post(globalServerUrl+"/competition/addrule.do",Qs.stringify(this.form
                            )).then((res) => {
                                if(res.data == 1){
                                    this.addVisible = false;
                                    this.$message.success(`添加成功`);
                                    this.getData();
                                }else if(res.data == 2){
                                    this.$message.error(`添加失败`);
                                }
                            })
                            }else if(this.dialogTitle === "编辑比赛规则"){
                                if(this.form.comid === undefined){
                                }else{
                                    this.$delete(this.form,"comid");
                                }
                                this.$set(this.form,"id",this.ruleId);
                                this.$axios.post(globalServerUrl+"/competition/editrule.do",Qs.stringify(this.form
                                )).then((res) => {
                                    if(res.data == 1){
                                        this.addVisible = false;
                                        this.$message.success(`修改成功`);
                                        this.getData();
                                    }else if(res.data == 2){
                                        this.$message.error(`修改失败`);
                                    }
                                })
                            }
                        
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
                
            },
            // 编辑按钮
            handleEdit(row) {
                this.ruleId = row.id;
                this.addVisible = true;
                this.dialogTitle = "编辑比赛规则";
                this.form = {
                    title: row.title,
                    content: row.content
                };
                this.content = row.content;
            },
            // 添加按钮
            handleAdd(){
                this.cropImg = "";
                this.addVisible = true;
                this.dialogTitle = "添加比赛规则";
                this.form = {};
                this.content = "";
            },
            // 删除按钮
            handleDelete(id) {
                this.ruleId = id;
                this.delVisible = true;
            },
            // 确定删除
            deleteRow(){
                this.$axios.post(globalServerUrl+"/competition/deleterule.do",Qs.stringify({
                    id: this.ruleId
                })).then((res) => {
                    if(res.data == 1){
                        this.$message.success('删除成功');
                        this.getData();
                    }else{
                        this.$message.error('删除失败');
                    }
                    this.delVisible = false;
                })
            },
            // 分页
            handleCurrentChange(val) {
                this.cur_page = val;
                this.getData();
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
                return isLt1M;
            },
            uploadSuccess(res, file) {
                console.log(res)
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
                this.loading = false;
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
                    // this.form.imgpath = globalServerUrl + res;
                }
            },
            onEditorChange({ editor, html, text }) {
                this.content = html;
            },
            onEditorReady(event){

            }
        },
        created(){
            this.comId = this.$route.query.comId;
            this.heading = this.$route.query.heading;
            this.nextHeading = this.$route.query.nextHeading;
            this.serverUrl = globalServerUrl + "/activity/fileupload.do";
            this.getData();
        }
    }
</script>
<style>
    
</style>
<style scoped>
    .handle-box {
        margin-bottom: 20px;
    }

    .handle-select {
        width: 120px;
    }

    .handle-input {
        width: 300px;
        display: inline-block;
    }
    .del-dialog-cnt{
        font-size: 16px;
        text-align: center
    }
    .table{
        width: 100%;
        font-size: 14px;
    }
    .blue{
        color: #409EFF;
    }
    .pre-img{   
        width: auto;
        height: 100px;
        background: #f8f8f8;
        border: 1px solid #eee;
        border-radius: 5px;
    }
    .crop-demo{
        /*display: flex;
        align-items: flex-end;*/
    }
    .uploadBox{
        position: relative;
    }
    .crop-demo-btn{
        display: inline-block;
        width: 90px;
        height: 30px;
        line-height: 30px;
        padding: 0 20px;
        margin-left: 30px;
        background-color: #fa820c;
        color: #fff;
        font-size: 12px;
        border-radius: 4px;
        box-sizing: border-box;
        position: absolute;
        top: 50%;
        margin-top: -20px;
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
    .cell img.banner{
        width: 60%;
    }
</style>