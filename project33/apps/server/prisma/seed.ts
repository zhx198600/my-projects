import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const RoleCode = {
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
  COUNSELOR: 'COUNSELOR',
  DEPARTMENT_HEAD: 'DEPARTMENT_HEAD',
  VICE_PRESIDENT: 'VICE_PRESIDENT',
  ACADEMIC_AFFAIRS: 'ACADEMIC_AFFAIRS',
  FINANCE_DEPARTMENT: 'FINANCE_DEPARTMENT',
  ADMIN: 'ADMIN',
};

const OrgType = {
  UNIVERSITY: 'UNIVERSITY',
  COLLEGE: 'COLLEGE',
  DEPARTMENT: 'DEPARTMENT',
  OFFICE: 'OFFICE',
};

async function main() {
  console.log('开始初始化数据...');

  const roles = [
    { code: RoleCode.STUDENT, name: '学生', description: '普通学生角色' },
    { code: RoleCode.TEACHER, name: '任课教师', description: '授课教师角色' },
    { code: RoleCode.COUNSELOR, name: '辅导员', description: '班级辅导员角色' },
    { code: RoleCode.DEPARTMENT_HEAD, name: '部门负责人', description: '学院/部门领导' },
    { code: RoleCode.VICE_PRESIDENT, name: '分管领导', description: '校分管领导' },
    { code: RoleCode.ACADEMIC_AFFAIRS, name: '教务处', description: '教务处工作人员' },
    { code: RoleCode.FINANCE_DEPARTMENT, name: '财务处', description: '财务处工作人员' },
    { code: RoleCode.ADMIN, name: '系统管理员', description: '系统超级管理员' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {},
      create: role,
    });
    console.log(`创建角色: ${role.name}`);
  }

  const university = await prisma.organization.upsert({
    where: { code: 'UNIV001' },
    update: {},
    create: {
      name: 'XX大学',
      code: 'UNIV001',
      type: OrgType.UNIVERSITY,
      level: 1,
    },
  });
  console.log('创建组织: XX大学');

  const colleges = [
    { name: '计算机学院', code: 'CS001' },
    { name: '经济管理学院', code: 'MBA001' },
    { name: '外国语学院', code: 'FL001' },
  ];

  for (const college of colleges) {
    await prisma.organization.upsert({
      where: { code: college.code },
      update: {},
      create: {
        name: college.name,
        code: college.code,
        type: OrgType.COLLEGE,
        parentId: university.id,
        level: 2,
      },
    });
    console.log(`创建学院: ${college.name}`);
  }

  const departments = [
    { name: '教务处', code: 'ACADEMIC001', type: OrgType.DEPARTMENT },
    { name: '财务处', code: 'FINANCE001', type: OrgType.DEPARTMENT },
    { name: '校长办公室', code: 'ADMIN001', type: OrgType.OFFICE },
  ];

  for (const dept of departments) {
    await prisma.organization.upsert({
      where: { code: dept.code },
      update: {},
      create: {
        name: dept.name,
        code: dept.code,
        type: dept.type,
        parentId: university.id,
        level: 2,
      },
    });
    console.log(`创建部门: ${dept.name}`);
  }

  const adminRole = await prisma.role.findUnique({
    where: { code: RoleCode.ADMIN },
  });

  const hashedPassword = await bcrypt.hash('admin123', 10);

  if (adminRole) {
    const admin = await prisma.user.upsert({
      where: { email: 'admin@university.edu' },
      update: {},
      create: {
        email: 'admin@university.edu',
        name: '系统管理员',
        employeeId: 'ADMIN001',
        password: hashedPassword,
        userRoles: {
          create: {
            roleId: adminRole.id,
          },
        },
      },
    });
    console.log(`创建管理员用户: ${admin.email} / admin123`);
  }

  console.log('数据初始化完成！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
