<template>
    <div>
        <div class="container">
            <div class="handle-box">
                <el-form :inline="true" ref="formInline" :model="formInline" class="demo-form-inline">
                    <el-form-item label="参赛项目">
                        <el-select v-model="formInline.compId" placeholder="参赛项目">
                            <el-option 
                                v-for="item in selectItem"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="组别">
                        <el-select v-model="formInline.leixing" placeholder="组别">
                            <el-option label="普通组" value="0"></el-option>
                            <el-option label="家庭组" value="1"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="审核状态">
                        <el-select v-model="formInline.shenhe" placeholder="审核状态">
                            <el-option label="未审核" value="未审核"></el-option>
                            <el-option label="已通过" value="已通过"></el-option>
                            <el-option label="未通过" value="未通过"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="search('formInline')">查询</el-button>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="exportExcel('formInline')">导出</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <el-table :data="tableData" border class="table">
                <el-table-column label="参赛项目" width="200" align="center" prop="compname"></el-table-column>
                <el-table-column label="区" width="80" align="center" prop="quyu"></el-table-column>
                <el-table-column label="邮编" width="80" align="center" prop="youbian"></el-table-column>
                <el-table-column label="领队" width="80" align="center" prop="lingdui"></el-table-column>
                <el-table-column label="联系电话" width="110" align="center" prop="mobile"></el-table-column>
                <el-table-column label="联系地址" width="200" align="center" prop="dizhi"></el-table-column>
                <el-table-column label="电子邮箱" width="200" align="center" prop="email"></el-table-column>
                <el-table-column label="组别" width="50"  align="center" prop="zubie"></el-table-column>
                <el-table-column label="参赛队名" width="200"  align="center" prop="zuname"></el-table-column>

                <template v-if="formInline.leixing == 0">
                    <el-table-column label="队员1" width="80" align="center" prop="studentname"></el-table-column>
                </template>
                <template v-if="formInline.leixing == 0">
                    <el-table-column label="学生姓名" width="80" align="center" prop="studentname"></el-table-column>
                </template>

                <el-table-column label="性别" width="50" align="center" prop="sex"></el-table-column>
                <el-table-column label="身份证号" width="150" align="center" prop="idnumber"></el-table-column>
                <el-table-column label="学校" width="200" align="center" prop="xuexiao"></el-table-column>
                <template v-if="formInline.leixing == 0">
                    <el-table-column label="队员2" width="80" align="center" prop="student2name"></el-table-column>
                    <el-table-column label="性别" width="50" align="center" prop="sex2"></el-table-column>
                    <el-table-column label="身份证号" width="150" align="center" prop="idnumber2"></el-table-column>
                    <el-table-column label="学校" width="200" align="center" prop="xuexiao2"></el-table-column>
                </template>
                <template v-if="formInline.leixing == 1">
                    <el-table-column label="家长1" width="80" align="center" prop="parentone"></el-table-column>
                    <el-table-column label="家长2" width="80" align="center" prop="parenttwo"></el-table-column>
                </template>

                <el-table-column label="辅导教师" width="80" align="center" prop="teacher"></el-table-column>
                <el-table-column label="操作" fixed="right" width="180" align="center">
                    <template slot-scope="scope">
                        <el-button type="success"  plain v-if="scope.row.teacherstatus=='未审核'" @click="handleYes(scope.row)">通过</el-button>
                        <el-button type="primary" plain v-if="scope.row.teacherstatus=='未审核'" @click="handleNo(scope.row)">不通过</el-button>
                        <el-button type="text" class="blue"  plain icon="el-icon-circle-check-outline" v-if="scope.row.teacherstatus=='已通过'">已通过</el-button>
                        <el-button type="text" plain icon="el-icon-circle-close-outline" v-if="scope.row.teacherstatus=='未通过'">未通过</el-button>
                    </template>
                </el-table-column>
            </el-table>
             <div class="pagination" v-show="totalNumber>0">
                <el-pagination background @current-change="handleCurrentChange" layout="prev, pager, next" :total="totalNumber"></el-pagination>
            </div>
        </div>
        <!-- 审核通过提示 -->
        <el-dialog title="提示" :visible.sync="yesReview" width="300px" center>
            <div class="del-dialog-cnt">确定通过该审核吗？</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="yesReview = false">取消</el-button>
                <el-button type="primary" @click="reviewYes">确定</el-button>
            </span>
        </el-dialog>
        <!-- 审核不通过提示 -->
        <el-dialog title="提示" :visible.sync="noReview" ref="formNo" width="400px" center>
            <el-form ref="formNo" :model="formNo" :rules="rules" label-width="100px" >
                <el-form-item label="不通过理由" prop="reason">
                    <el-input type="textarea" v-model="formNo.reason"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="noReview = false">取消</el-button>
                <el-button type="primary" @click="reviewNo('formNo')">确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import Qs from 'qs';
    export default {
        name: 'entername',
        data: function(){
            return {
                tableData: [],
                yesReview: false,   //审核确定弹框
                noReview: false,  //审核不通过确定
                formInline: {
                    compId: '',
                    leixing: '',
                    shenhe: ''
                },
                formNo:{
                    reason: ''
                },
                rules:{
                    reason:[
                        { required: true, message: '请输入原因', trigger: 'blur' }
                    ]
                },
                compId: '',
                lexing: '',
                shenhe: '',
                selectItem:[],
                itemId: 0, // 审核Id
                cur_page: 1,   //当前页
                limit: 10,  //每页几条
                totalNumber: 1  //列表总条数
            }
        },
        methods:{
            // 项目列表
            getSelect(){
                this.$axios.post(globalServerUrl+"/baoming/getAllCompList.do"
                ).then((res) => {
                    this.selectItem = res.data;
                })
            },
            // 查询
            search(formName){
                this.$refs[formName].validate((valid) => {
                    if(valid){
                        this.compId = this.formInline.compId;
                        this.leixing = this.formInline.leixing;
                        this.shenhe = this.formInline.shenhe;
                        this.getData(this.limit,this.cur_page,this.compId,this.leixing,this.shenhe);
                    }
                })
            },
            // 导出
            exportExcel(formName){
                this.$refs[formName].validate((valid) => {
                    if(valid){
                        this.compId = this.formInline.compId;
                        this.leixing = this.formInline.leixing;
                        this.shenhe = this.formInline.shenhe;
                        this.$axios.post(globalServerUrl+"/baoming/exportExcel.do",Qs.stringify({
                            compId: this.compId,
                            leixing: this.leixing,
                            shenhe:  this.shenhe
                        })).then((res) => {
                            window.location.href = globalServerUrl + res.data.url;
                        })
                    }
                })
            },
            // 初始化表格数据
            getData(limit,page,compId,leixing,shenhe) {
                this.$axios.post(globalServerUrl+"/baoming/getBaomingList.do",Qs.stringify({
                    limit:limit,
                    page:page,
                    compId:compId,
                    leixing:leixing,
                    shenhe: shenhe
                })).then((res) => {
                    this.tableData = res.data.data;
                    this.totalNumber = res.data.count;
                })
            },
            // 审核通过按钮
            handleYes(item){
                this.itemId = item.id;
                this.yesReview = true;
            },
            // 确定审核通过
            reviewYes(){
                this.$axios.post(globalServerUrl+"/baoming/updateBMshenhe.do",Qs.stringify({
                    id: this.itemId
                })).then((res) => {
                    if(res.data == true){
                        this.msgYes();
                    }else{
                        this.msgNo();
                    }
                    this.yesReview = false;
                    this.getData(this.limit,this.cur_page,this.compId,this.leixing,this.shenhe);
                })
            },
            // 审核通过成功
            msgYes(){
                this.$message({
                    message: '操作成功',
                    type: 'success'
                });
            },
            // 审核通过失败
            msgNo(){
                this.$message.error('操作失败');
            },
            //审核不通过按钮
            handleNo(item){
                this.itemId = item.id;
                this.noReview = true;
            },
            //确定审核不通过
            reviewNo(formName){
                this.$refs[formName].validate((valid) => {
                    if(valid){
                        this.$axios.post(globalServerUrl+"/baoming/updateBMshenheno.do",Qs.stringify({
                            id: this.itemId,
                            reson: this.formNo.reason
                        })).then((res) => {
                            console.log(res);
                            console.log(res.data);
                            console.log(res.data == true);
                            if(res.data == true){
                                this.msgYes();
                            }else{
                                this.msgNo();
                            }
                            this.noReview = false;
                            this.getData(this.limit,this.cur_page,this.compId,this.leixing,this.shenhe);
                        })
                    }
                })
                
            },
            // 分页
            handleCurrentChange(val) {
                this.cur_page = val;
                this.getData(this.limit,this.cur_page,this.compId,this.leixing,this.shenhe);
            }
        },
        created(){
            this.getSelect();
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