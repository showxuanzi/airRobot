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
                <el-button type="primary" icon="delete" class="handle-del mr10" @click="handleAdd()">添加比赛视频</el-button>
            </div>
            <el-table :data="tableData" border class="table">
                <el-table-column label="比赛视频" align="center">
                    <template slot-scope="scope">
                        <video class="listvideo" :src="scope.row.videopath" controls="controls"></video>
                    </template>
                </el-table-column>
                <el-table-column label="视频名称" align="center" prop="title"></el-table-column>
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
        <el-dialog :title="dialogTitle" :visible.sync="addVisible" width="30%" v-loading="loading" 
                element-loading-text="视频上传中，请稍等"
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(0, 0, 0, 0.6)">
            <el-form ref="form" :model="form" :rules="rules" label-width="100px" >
               <el-form-item label="视频名称" prop="title">
                    <el-input v-model="form.title"></el-input>
                </el-form-item>
                 <el-form-item label="比赛视频" prop="videopath">
                    <video class="pre-video" ref="video" controls="controls" :src="form.videopath" v-show="form.videopath">
                        您的浏览器不支持视频播放，请更换浏览器
                    </video>
                    <div class="crop-demo-btn">选择视频
                        <input class="crop-input" type="file" name="image" accept="video/*" @change="setImage"/>
                    </div>
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
                dialogTitle: "添加比赛视频",
                tableData: [],
                addVisible: false,   // 添加弹框是否显示
                delVisible: false,   //删除弹框是否显示
                form: {
                    title: '',
                    videopath: ''
                },
                rules:{
                    title:[
                        { required: true, message: '请输入视频名称', trigger: 'blur' }
                    ],
                    videopath:[
                        { required: true, message: '请上传视频', trigger: 'change' }
                    ]
                },
                //服务器地址
                cur_page: 1,   //当前页
                totalNumber: 1,  //列表总条数
                comId: 0, //项目id
                serverUrl: '',  // 上传的图片服务器地址
                content: '',
                loading: false,
                videoId: 0
            }
        },
        methods:{
            // 初始化表格数据
            getData() {
                this.$axios.post(globalServerUrl+"/competition/videoList.do",Qs.stringify({
                    comid: this.comId, 
                    page: this.cur_page,
                    limit: 10
                })
                ).then((res) => {
                    console.log(res.data.data)
                    this.tableData = res.data.data;
                    this.totalNumber = res.data.count;
                })
            },
            // 添加竞赛名称
            addSave(formName) {
                console.log(this.form)
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        if(this.dialogTitle === "添加比赛视频"){
                            this.$set(this.form,"comid",this.comId);
                            if(this.form.id === undefined){
                            }else{
                                this.$delete(this.form,"id");
                            }
                            this.$axios.post(globalServerUrl+"/competition/addvideo.do",Qs.stringify(this.form
                            )).then((res) => {
                                if(res.data == 1){
                                    this.addVisible = false;
                                    this.$message.success(`添加成功`);
                                    this.getData();
                                }else if(res.data == 2){
                                    this.$message.error(`添加失败`);
                                }
                            })
                            }else if(this.dialogTitle === "编辑比赛视频"){
                                if(this.form.comid === undefined){
                                }else{
                                    this.$delete(this.form,"comid");
                                }
                                this.$set(this.form,"id",this.videoId);
                                this.$axios.post(globalServerUrl+"/competition/editvideo.do",Qs.stringify(this.form
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
                this.videoId = row.id;
                this.addVisible = true;
                this.dialogTitle = "编辑比赛视频";
                this.form = {
                    title: row.title,
                    videopath: row.videopath
                };
            },
            // 添加按钮
            handleAdd(){
                this.form.videopath = "";
                this.addVisible = true;
                this.dialogTitle = "添加比赛视频";
                this.form = {};
            },
            // 删除按钮
            handleDelete(id) {
                this.videoId = id;
                this.delVisible = true;
            },
            // 确定删除
            deleteRow(){
                this.$axios.post(globalServerUrl+"/competition/deletevideo.do",Qs.stringify({
                    id: this.videoId
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
            // 上传图片
            setImage(e){
                this.loading = true;
                const file = e.target.files[0];
                let formData = new FormData();
                formData.append("file",file);
                this.$axios.post(globalServerUrl+"/activity/fileupload.do",
                    formData,
                ).then((res)=>{
                    this.form.videopath = globalServerUrl + res.data;
                    this.loading = false;
                })
            }
        },
        created(){
            this.heading = this.$route.query.heading;
            this.nextHeading = this.$route.query.nextHeading;
            this.comId = this.$route.query.comid;
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
    .pre-video{   
        width: 100%;
        /*background: #f8f8f8;*/
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
        /*position: absolute;
        top: 50%;
        margin-top: -20px;*/
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
    .cell video.listvideo{
        width: 50%;
    }
</style>