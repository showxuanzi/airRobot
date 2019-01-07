<template>
    <div class="table">
        <div class="container">
            <div class="handle-box">
                <el-button type="primary" icon="delete" class="handle-del mr10" @click="delAll">批量删除</el-button>
                <el-button type="primary" @click="add">添加</el-button>
               <!--  <el-select v-model="select_cate" placeholder="筛选省份" class="handle-select mr10">
                    <el-option key="1" label="广东省" value="广东省"></el-option>
                    <el-option key="2" label="湖南省" value="湖南省"></el-option>
                </el-select> -->
                <el-input v-model="select_word" placeholder="筛选关键词" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="search" @click="search">搜索</el-button>
            </div>
            <el-table :data="data" border class="table" ref="multipleTable" @selection-change="handleSelectionChange">
                <!-- <el-table-column type="selection" align="center" width="80"></el-table-column>
                <el-table-column prop="id" label="设备编号" align="center"></el-table-column>
                <el-table-column prop="num" label="监测数据点" width="180" align="center"></el-table-column>
                <el-table-column prop="time" label="更新时间" width="200" align="center"></el-table-column> -->
                <el-table-column type="selection" align="center" width="80"></el-table-column>
                <el-table-column prop="devicename" label="设备编号" align="center"></el-table-column>
                <el-table-column prop="address" label="设备位置" align="center"></el-table-column>
                <el-table-column prop="position" label="经纬度" align="center"></el-table-column>
                <el-table-column label="操作" align="center" width="180">
                    <template slot-scope="scope">
                        <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                        <el-button type="text" icon="el-icon-delete" class="red" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination background @current-change="handleCurrentChange" layout="prev, pager, next" :total="totalNum">
                </el-pagination>
            </div>
        </div>

        <!-- 编辑弹出框 -->
        <el-dialog :title="dialogTitle" :visible.sync="editVisible" width="30%">
            <el-form ref="form" :model="form" :rules="rules" label-width="50px">
                <!-- <el-form-item label="日期">
                    <el-date-picker type="date" placeholder="选择日期" v-model="form.date" value-format="yyyy-MM-dd" style="width: 100%;"></el-date-picker>
                </el-form-item> -->
                <!-- <el-form-item label="企业名称" class="my-label">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="企业地址">
                    <el-input v-model="form.address"></el-input>
                </el-form-item>
                <el-form-item label="监测数据点">
                    <el-input v-model="form.num"></el-input>
                </el-form-item>
                <el-form-item label="联系方式">
                    <el-input v-model="form.phone"></el-input>
                </el-form-item> -->
                <el-form-item prop="devicename" label="设备编号" class="my-label marginL100">
                    <el-input v-model="form.devicename"></el-input>
                </el-form-item>
                <el-form-item prop="address" label="设备位置" class="my-label marginL100">
                    <el-input v-model="form.address"></el-input>
                </el-form-item>
                <el-form-item prop="position" label="经纬度" class="my-label marginL100">
                    <el-input v-model="form.position"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit('form')">确 定</el-button>
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
    export default {
        name: 'equipment',
        data() {
            return {
                url: './static/vuetable.json',
                tableData: [],
                cur_page: 1,
                multipleSelection: [],
                select_cate: '',
                select_word: '',
                del_list: [],
                is_search: false,
                editVisible: false,
                delVisible: false,
                form: {
                    devicename: '',
                    address: '',
                    position: ''
                },
                rules: {
                    devicename: [{ 
                        required: true, //是否必填
                        message: '设备编号不能为空', //规则
                        trigger: 'blur' //触发事件
                    }],
                    address: [{ 
                        required: true, 
                        message: '设备位置不能为空',
                         trigger: 'blur' 
                    }],
                    position: [{ 
                        required: true, 
                        message: '经纬度不能为空',
                         trigger: 'blur' 
                    }],
                },
                idx: -1,// 删除操作时的id
                dialogTitle:"添加", // 添加 or 编辑
                totalNum: 0, //表单总条数
                userId: 0, // 用户id
                listItemId: null // 编辑时所选项的id
            }
        },
        created() {
            this.getData(this.cur_page);
            this.userId = sessionStorage.getItem('hb_userid');
        },
        computed: {
            data() {
                // return this.tableData.filter((d) => {
                //     let is_del = false;
                //     for (let i = 0; i < this.del_list.length; i++) {
                //         if (d.id === this.del_list[i].id) {
                //             is_del = true;
                //             break;
                //         }
                //     }
                //     if (!is_del) {
                //         if (d.num.indexOf(this.select_cate) > -1 &&
                //             (d.id.indexOf(this.select_word) > -1 ||
                //                 d.num.indexOf(this.select_word) > -1)
                //         ) {
                //             console.log(d);
                //             return d;
                //         }
                //     }
                // })
                return this.tableData
            }
        },
        methods: {
            // 分页导航
            handleCurrentChange(val) {
                this.cur_page = val;
                this.getData(this.cur_page);
            },
            getData(page) {
                this.$axios.get("http://192.168.1.102:8080/device/deviceList.do?",{
                    params:{
                        page: page,
                        limit: 10
                    }
                }).then((res) => {
                    this.tableData = res.data.data;
                    this.totalNum = res.data.count;
                })
            },
            search() {
                this.is_search = true;
            },
            formatter(row, column) {
                return row.address;
            },
            filterTag(value, row) {
                return row.tag === value;
            },
            handleEdit(index, row) {
                this.listItemId = row.id;
                const item = this.tableData[index];
                this.form = {
                    devicename: item.devicename,
                    address: item.address,
                    position: item.position
                }
                this.editVisible = true;
                this.dialogTitle = "编辑";
            },
            handleDelete(index, row) {
                this.idx = row.id;
                this.delVisible = true;
            },
            delAll() {
                const length = this.multipleSelection.length;
                let str = '';
                this.del_list = this.del_list.concat(this.multipleSelection);
                for (let i = 0; i < length; i++) {
                    str += this.multipleSelection[i].name + ' ';
                }
                this.$message.error('删除了' + str);
                this.multipleSelection = [];
            },
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },
            // 添加 or 编辑 保存 添加的时候listItemId为null，每次编辑完成之后把listItemId置为null
            saveEdit(formName) {
                this.$refs[formName].validate((valid) =>{
                    if(valid){
                        this.editVisible = false;
                        this.$axios.get("http://192.168.1.102:8080/device/adddevice.do?",{
                            params:{
                                devicename: this.form.devicename,
                                position: this.form.position,
                                address: this.form.address,
                                userId: this.userId,
                                id: this.listItemId
                            }
                        }).then((res)=>{
                            // 添加 & 编辑
                            if(this.listItemId === null){
                                if(res.data === 1){
                                    this.$message.success('添加成功');
                                    this.getData(this.cur_page);
                                }else if(res.data === 2){
                                    this.$message.error('添加失败，请重试');
                                }else{
                                    this.$message.error('系统错误，请稍后');
                                }
                            }else{
                                if(res.data === 1){
                                    this.$message.success('修改成功');
                                    this.getData(this.cur_page);
                                }else if(res.data === 2){
                                    this.$message.error('修改失败，请重试');
                                }else{
                                    this.$message.error('系统错误，请稍后');
                                }
                                this.listItemId = null;
                            }
                        })
                    }else{
                        return false;
                    }
                })
                
            },
            // 确定删除
            deleteRow(){
                this.$axios.get("http://192.168.1.102:8080/device/deletedevice.do?",{
                    params:{
                        id: this.idx
                    }
                }).then((res)=>{
                    if(res.data === 1){
                        this.$message.success('删除成功');
                        this.getData(this.cur_page);
                    }else if(res.data === 2){
                        this.$message.error('删除失败，请重试');
                    }else{
                        this.$message.error('系统错误，请稍后');
                    }
                    this.delVisible = false;
                })
            },
            // 添加
            add(){
                this.editVisible = true;
                this.dialogTitle = "添加";
                // this.$nextTick(() => {
                //   this.$refs['form'].resetFields();
                // });
                console.log(this.form);
                // this.form = {};
            }
        }
    }

</script>
<style type="text/css">
    .marginL100 .el-form-item__label{
        width: 100px!important;
    }
    .marginL100 .el-form-item__content{
        margin-left: 100px!important;
    }
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
    .red{
        color: #ff0000;
    }
</style>
