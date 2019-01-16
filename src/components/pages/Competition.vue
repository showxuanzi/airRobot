<template>
    <div>
        <div class="container">
            <div class="handle-box">
                <el-button type="primary" icon="delete" class="handle-del mr10" @click="handleAdd()">添加竞赛活动</el-button>
            </div>
            <el-table :data="tableData" border class="table">
                <el-table-column label="活动名称" align="center" prop="name"></el-table-column>
                <!-- <el-table-column prop="order" label="顺序" width="100" align="center"></el-table-column> -->
                <!-- <el-table-column prop="date" label="上传时间" width="200" align="center"></el-table-column> -->
                <el-table-column label="操作" width="300" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" icon="el-icon-edit" class="blue" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button type="text" icon="el-icon-lx-attention" @click="handleLook(scope.row)">查看所有项目</el-button>
                        <el-button type="text" icon="el-icon-delete" class="blue" @click="handleDelete(scope.row.id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
             <div class="pagination" v-show="totalNumber>0">
                <el-pagination background @current-change="handleCurrentChange" layout="prev, pager, next" :total="totalNumber"></el-pagination>
            </div>
        </div>
        <!-- 编辑弹出框 -->
        <el-dialog :title="dialogTitle" :visible.sync="addVisible" width="30%">
            <el-form ref="form" :model="form" :rules="rules" label-width="100px" >
               <el-form-item label="竞赛名称" prop="name">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <!--  <el-form-item label="日期">
                    <el-date-picker type="date" placeholder="选择日期" v-model="form.date" value-format="yyyy-MM-dd" style="width: 100%;"></el-date-picker>
                </el-form-item>  -->
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
                dialogTitle: "添加竞赛活动",
                tableData: [],
                addVisible: false,   // 添加弹框是否显示
                delVisible: false,   //删除弹框是否显示
                form: {
                    name: '',
                },
                rules:{
                    name:[
                        { required: true, message: '请输入活动', trigger: 'blur' }
                    ]
                },
                itemId: 0,
                //服务器地址
                deleteNameId: "",  //删除活动的id
                cur_page: 1,   //当前页
                totalNumber: 1  //列表总条数
            }
        },
        methods:{
            // 初始化表格数据
            getData() {
                this.$axios.post(globalServerUrl+"/competition/zongcompList.do",Qs.stringify({
                    page: this.cur_page,
                    limit: 10
                })
                ).then((res) => {
                    this.tableData = res.data.data;
                    this.totalNumber = res.data.count;
                })
            },
            // 添加竞赛名称
            addSave(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        if(this.dialogTitle === "添加竞赛活动"){ // 添加时的保存
                            // 判断form中是否有id，若有则删除
                            if(this.form.id === undefined){
                            }else{
                                this.$delete(this.form,"id");
                            }
                            this.$axios.post(globalServerUrl+"/competition/zongcominsert.do",Qs.stringify(this.form
                            )).then((res) => {
                                if(res.data == 1){
                                    this.addVisible = false;
                                    this.$message.success(`添加成功`);
                                    this.getData();
                                }else if(res.data == 2){
                                    this.$message.error(`添加失败`);
                                }
                            })
                        }else if(this.dialogTitle === "编辑竞赛活动"){  //编辑时的保存
                            this.$set(this.form,"id",this.itemId);
                            this.$axios.post(globalServerUrl+"/competition/editzongcompSave.do",Qs.stringify(this.form
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
            handleEdit(item){
                this.itemId = item.id;
                this.addVisible = true;
                this.dialogTitle = "编辑竞赛活动";
                this.form =  {
                    name: item.name,
                }
            },
            // 查看所有项目
            handleLook(item) {
                this.$router.push({
                    path: '/competitionItem',
                    query:{
                        zongcompId: item.id,
                        heading: item.name
                    }
                })
            },
            // 添加按钮
            handleAdd(){
                this.form = {};
                this.addVisible = true;
                this.dialogTitle = "添加竞赛活动";
            },
            // 删除按钮
            handleDelete(id) {
                this.deleteNameId = id;
                this.delVisible = true;
            },
            // 确定删除
            deleteRow(){
                this.$axios.post(globalServerUrl+"/competition/deletezongcomp.do",Qs.stringify({
                    id: this.deleteNameId
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
            }
        },
        created(){
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