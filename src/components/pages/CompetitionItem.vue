<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-lx-calendar"></i> 竞赛活动</el-breadcrumb-item>
                <el-breadcrumb-item>{{heading}}</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-button type="primary" icon="delete" class="handle-del mr10" @click="handleAdd()">添加项目</el-button>
            </div>
            <el-table :data="tableData" border class="table">
                <el-table-column label="活动名称" align="center" prop="name"></el-table-column>
                <el-table-column label="报名开始时间" align="center" prop="baomingstartTime"></el-table-column>
                <el-table-column label="报名结束时间" align="center" prop="baomingendTime"></el-table-column>
                <el-table-column label="比赛时间" align="center" prop="compTime"></el-table-column>
                <el-table-column label="添加操作" width="400" align="center">
                    <template slot-scope="scope">
                        <el-button type="primary" plain @click="addComRule(scope.row)">比赛规则</el-button>
                        <el-button type="success" plain >规则答疑</el-button>
                        <el-button type="info" plain @click="addComVideo(scope.row)">比赛视频</el-button>
                        <el-button type="warning" plain>获奖学生</el-button>
                    </template>
                </el-table-column> 
                <el-table-column label="操作" width="150" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" icon="el-icon-lx-edit" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button type="text" icon="el-icon-delete" class="blue" @click="handleDelete(scope.row.id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
             <div class="pagination" v-show="totalNumber>0">
                <el-pagination background @current-change="handleCurrentChange" layout="prev, pager, next" :total="totalNumber"></el-pagination>
            </div>
        </div>
        <!-- 编辑弹出框 -->
        <el-dialog :title="dialogTitle" :visible.sync="addVisible" width="30%" >
            <el-form ref="form" :model="form" :rules="rules" label-width="130px" >
               <el-form-item label="竞赛名称" prop="name">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="报名开始时间" prop="baomingstartTime">
                    <el-date-picker type="datetime" placeholder="选择日期" format="yyyy-MM-dd HH:mm:ss" value-format='yyyy-MM-dd HH:mm:ss' v-model="form.baomingstartTime"  style="width: 100%;"></el-date-picker>
                </el-form-item> 
                 <el-form-item label="报名结束时间" prop="baomingendTime">
                    <el-date-picker type="datetime" placeholder="选择日期" format="yyyy-MM-dd HH:mm:ss" value-format='yyyy-MM-dd HH:mm:ss' v-model="form.baomingendTime"  style="width: 100%;"></el-date-picker>
                </el-form-item> 
                 <el-form-item label="比赛时间" prop="compTime">
                    <el-date-picker type="datetime" placeholder="选择日期" format="yyyy-MM-dd HH:mm:ss" value-format='yyyy-MM-dd HH:mm:ss' v-model="form.compTime" style="width: 100%;"></el-date-picker>
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
    export default {
        name: 'home',
        data: function(){
            return {
                heading: "",
                dialogTitle: "添加竞赛活动",
                tableData: [],
                addVisible: false,   // 添加弹框是否显示
                delVisible: false,   //删除弹框是否显示
                form: {
                    name: '',
                    baomingstartTime: '',
                    baomingendTime: '',
                    compTime: ''
                },
                rules:{
                    name:[
                        { required: true, message: '请输入竞赛名称', trigger: 'blur' }
                    ],
                    baomingstartTime:[
                        { required: true, message: '请选择报名开始时间', trigger: 'blur' }
                    ],
                    baomingendTime:[
                        { required: true, message: '请选择报名结束时间', trigger: 'blur' }
                    ],
                    compTime:[
                        { required: true, message: '请选择比赛时间', trigger: 'blur' }
                    ]
                },
                //服务器地址
                cropImg:"",
                deleteItemId: "",  //删除活动的id
                loading: false,   // 加载动画是否显示
                cur_page: 1,   //当前页
                totalNumber: 1, //列表总条数
                zongcompId: 0 ,// 竞赛活动id
                itemId: 0
            }
        },
        methods:{
            // 初始化表格数据
            getData() {
                this.$axios.post(globalServerUrl+"/competition/compList.do",Qs.stringify({
                    zongcompId: this.zongcompId,
                    page: this.cur_page,
                    limit: 10
                })
                ).then((res) => {
                    this.tableData = res.data.data;
                    this.totalNumber = res.data.count;
                })
            },
            // 添加项目
            addSave(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {    //表单验证通过
                        if(this.form.baomingstartTime > this.form.baomingendTime){
                            this.$message.error('报名开始时间不能超过报名结束时间');
                            this.form.baomingendTime = "";
                        }else if(this.form.baomingendTime > this.form.compTime){
                             this.$message.error('比赛时间不能早于报名结束时间');
                             this.form.compTime = "";
                        }else{
                            this.$set(this.form,"zongcompId",this.zongcompId);
                            if(this.dialogTitle === "添加竞赛活动"){ // 添加时的保存
                                // 判断form中是否有id，若有则删除
                                if(this.form.id === undefined){
                                }else{
                                    this.$delete(this.form,"id");
                                }
                                this.$axios.post(globalServerUrl+"/competition/addcomp.do",Qs.stringify(this.form
                                )).then((res) => {
                                    if(res.data == 1){
                                        this.$message.success(`添加成功`);
                                        this.getData();
                                    }else if(res.data == 2){
                                        this.$message.error(`添加失败`);
                                    }
                                    this.addVisible = false;
                                })
                            }else if(this.dialogTitle === "编辑竞赛活动"){  //编辑时的保存
                                this.$set(this.form,"id",this.itemId);
                                this.$axios.post(globalServerUrl+"/competition/editcomp.do",Qs.stringify(this.form
                                )).then((res) => {
                                    if(res.data == 1){
                                        this.$message.success(`修改成功`);
                                        this.getData();
                                    }else if(res.data == 2){
                                        this.$message.error(`修改失败`);
                                    }
                                    this.addVisible = false;
                                })
                            }
                        }
                       
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
                
            },
            // 编辑按钮
            handleEdit(row) {
                this.itemId = row.id;
                this.addVisible = true;
                this.dialogTitle = "编辑竞赛活动";
                this.form = {
                    name: row.name,
                    baomingstartTime: row.baomingstartTime,
                    baomingendTime: row.baomingendTime,
                    compTime: row.compTime
                }
            },
            // 添加按钮
            handleAdd(){
                this.cropImg = "";
                this.addVisible = true;
                this.dialogTitle = "添加竞赛活动";
                this.form = {};
            },
            // 删除按钮
            handleDelete(id) {
                this.deleteItemId = id;
                this.delVisible = true;
            },
            // 确定删除
            deleteRow(){
                this.$axios.post(globalServerUrl+"/competition/deletecomp.do",Qs.stringify({
                    id: this.deleteItemId
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
            // 添加比赛规则
            addComRule(item){
                this.$router.push({
                    path:'/comItemRule',
                    query:{
                       comId: item.id ,
                       heading: this.heading,
                       nextHeading: item.name
                    }
                })
            },
            // 添加比赛视频
            addComVideo(item){
                this.$router.push({
                    path:'/comItemVideo',
                    query:{
                        comid: item.id,
                        heading: this.heading,
                        nextHeading: item.name
                    }
                })
            }
        },
        created(){
            this.zongcompId = this.$route.query.zongcompId;
            this.heading = this.$route.query.heading;
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