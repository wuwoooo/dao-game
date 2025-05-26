-- 创建数据库
CREATE DATABASE IF NOT EXISTS dao_game DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE dao_game;

-- 应用所有者表
CREATE TABLE IF NOT EXISTS `owner` (
    `id` INT AUTO_INCREMENT COMMENT '主键，所有者ID',
    `name` VARCHAR(100) NOT NULL COMMENT '所有者名称',
    `email` VARCHAR(100) NOT NULL COMMENT '注册邮箱（登录账号）',
    `password` VARCHAR(255) NOT NULL COMMENT '登录密码（加密存储）',
    `balance` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'SKY代币当前余额',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
    `is_deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除标记（0未删除，1已删除）',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='应用所有者表';

-- 游戏/应用表
CREATE TABLE IF NOT EXISTS `game_app` (
    `id` INT AUTO_INCREMENT COMMENT '主键，游戏/应用ID',
    `owner_id` INT NOT NULL COMMENT '所有者ID (外键，关联Owner表)',
    `name` VARCHAR(100) NOT NULL COMMENT '应用名称',
    `type` VARCHAR(20) NOT NULL COMMENT '类型（Game/应用）',
    `url` VARCHAR(255) NOT NULL COMMENT '页面地址（H5游戏链接或外链URL）',
    `icon` VARCHAR(255) DEFAULT NULL COMMENT '应用图标',
    `cover_image` VARCHAR(255) COMMENT '封面图',
    `embed_url` VARCHAR(255) COMMENT '嵌入URL',
    `external_url` VARCHAR(255) COMMENT '外部链接',
    `category` VARCHAR(255) COMMENT '分类',    
    `description` TEXT DEFAULT NULL COMMENT '应用描述',
    `tags` VARCHAR(255) DEFAULT NULL COMMENT '标签，多个标签以逗号分隔',
    `status` VARCHAR(20) DEFAULT 'Pending' COMMENT '上架状态（Pending/Approved/Rejected）',
    `visible` TINYINT DEFAULT 0 COMMENT '是否可见（0不可见，1可见）',
    `is_recommend` TINYINT DEFAULT 0 COMMENT '是否推荐 (0不推荐, 1推荐)',
    `views` INT DEFAULT 0 COMMENT '浏览量',
    `click_count` INT DEFAULT 0 COMMENT '点击次数',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '提交申请时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `reviewed_at` DATETIME DEFAULT NULL COMMENT '审核时间',
    `review_remark` VARCHAR(255) DEFAULT NULL COMMENT '审核备注',
    `is_deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除标记（0未删除，1已删除）',
    PRIMARY KEY (`id`),
    KEY `idx_owner_id` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='游戏/应用表';

-- 推广预算表
CREATE TABLE IF NOT EXISTS `budget` (
    `id` INT AUTO_INCREMENT COMMENT '主键，预算记录ID',
    `owner_id` INT NOT NULL COMMENT '所有者ID (外键)',
    `gameapp_id` INT NOT NULL COMMENT '游戏/应用ID (外键)',
    `daily_budget` DECIMAL(10, 2) NOT NULL COMMENT '每日预算 (SKY)',
    `total_budget` DECIMAL(10, 2) NOT NULL COMMENT '总预算 (SKY)',
    `placements` VARCHAR(255) DEFAULT NULL COMMENT '投放位置标识 (如首页、分类页等)',
    `start_date` DATE NOT NULL COMMENT '推广开始日期',
    `end_date` DATE NOT NULL COMMENT '推广结束日期',
    `status` TINYINT DEFAULT 1 COMMENT '推广计划状态（0暂停，1运行中）',
    `is_deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除标记（0未删除，1已删除）',
    PRIMARY KEY (`id`),
    KEY `idx_owner_id` (`owner_id`),
    KEY `idx_gameapp_id` (`gameapp_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='推广预算表';

-- 充值记录表
CREATE TABLE IF NOT EXISTS `recharge_record` (
    `id` INT AUTO_INCREMENT COMMENT '主键，充值记录ID',
    `owner_id` INT NOT NULL COMMENT '所有者ID (外键)',
    `amount` DECIMAL(10, 2) NOT NULL COMMENT '充值金额 (SKY)',
    `transaction_id` VARCHAR(100) DEFAULT NULL COMMENT '第三方交易单号',
    `status` TINYINT DEFAULT 0 COMMENT '充值状态（0处理中，1成功，2失败）',
    `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '充值时间',
    `is_deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除标记（0未删除，1已删除）',
    PRIMARY KEY (`id`),
    KEY `idx_owner_id` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='充值记录表';

-- 消耗记录表
CREATE TABLE IF NOT EXISTS `consumption_record` (
    `id` INT AUTO_INCREMENT COMMENT '主键，消耗记录ID',
    `owner_id` INT NOT NULL COMMENT '所有者ID (外键)',
    `gameapp_id` INT NOT NULL COMMENT '游戏/应用ID (外键)',
    `cost_type` VARCHAR(10) NOT NULL COMMENT '消费类型 (CPA 或 CPM)',
    `amount` DECIMAL(10, 2) NOT NULL COMMENT '消耗SKY代币数量',
    `count` INT NOT NULL COMMENT '计费次数（点击次数或展示次数/1000）',
    `date` DATE NOT NULL COMMENT '消耗日期',
    `is_deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除标记（0未删除，1已删除）',
    PRIMARY KEY (`id`),
    KEY `idx_owner_id` (`owner_id`),
    KEY `idx_gameapp_id` (`gameapp_id`),
    KEY `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消耗记录表';

-- 角色表
CREATE TABLE IF NOT EXISTS `role` (
    `id` INT AUTO_INCREMENT COMMENT '主键，角色ID',
    `name` VARCHAR(50) NOT NULL COMMENT '角色名称',
    `code` VARCHAR(50) NOT NULL COMMENT '角色编码',
    `description` VARCHAR(255) DEFAULT NULL COMMENT '角色描述',
    `is_deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除标记（0未删除，1已删除）',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- 权限表
CREATE TABLE IF NOT EXISTS `permission` (
    `id` INT AUTO_INCREMENT COMMENT '主键，权限ID',
    `name` VARCHAR(50) NOT NULL COMMENT '权限名称',
    `code` VARCHAR(50) NOT NULL COMMENT '权限编码',
    `description` VARCHAR(255) DEFAULT NULL COMMENT '权限描述',
    `is_deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除标记（0未删除，1已删除）',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限表';

-- 角色权限关联表
CREATE TABLE IF NOT EXISTS `role_permission` (
    `id` INT AUTO_INCREMENT COMMENT '主键ID',
    `role_id` INT NOT NULL COMMENT '角色ID',
    `permission_id` INT NOT NULL COMMENT '权限ID',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_role_permission` (`role_id`, `permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色权限关联表';

-- 管理员表
CREATE TABLE IF NOT EXISTS `admin` (
    `id` INT AUTO_INCREMENT COMMENT '主键，管理员ID',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '密码',
    `real_name` VARCHAR(50) DEFAULT NULL COMMENT '姓名',
    `role_id` INT NOT NULL COMMENT '角色ID',
    `last_login_time` DATETIME DEFAULT NULL COMMENT '最后登录时间',
    `status` TINYINT DEFAULT 1 COMMENT '状态（0禁用，1启用）',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除标记（0未删除，1已删除）',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- 用户点击记录表
CREATE TABLE IF NOT EXISTS `user_click_record` (
    `id` INT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `uid` VARCHAR(50) NOT NULL COMMENT '用户ID',
    `gameapp_id` INT NOT NULL COMMENT '游戏/应用ID',
    `click_time` DATETIME NOT NULL COMMENT '点击时间',
    `ip` VARCHAR(50) DEFAULT NULL COMMENT '用户IP地址',
    `user_agent` VARCHAR(255) DEFAULT NULL COMMENT '用户代理信息',
    `referer` VARCHAR(255) DEFAULT NULL COMMENT '来源页面',
    `is_deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除(0:未删除,1:已删除)',
    PRIMARY KEY (`id`),
    INDEX `idx_uid` (`uid`),
    INDEX `idx_gameapp_id` (`gameapp_id`),
    INDEX `idx_click_time` (`click_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户点击记录表'; 

-- 创建用户浏览记录表
CREATE TABLE IF NOT EXISTS `user_view_record` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uid` varchar(64) NOT NULL COMMENT '用户ID',
  `gameapp_id` int(11) NOT NULL COMMENT '游戏/应用ID',
  `view_time` datetime NOT NULL COMMENT '浏览时间',
  `ip` varchar(64) DEFAULT NULL COMMENT '用户IP地址',
  `user_agent` varchar(512) DEFAULT NULL COMMENT '用户代理信息',
  `referer` varchar(512) DEFAULT NULL COMMENT '来源页面',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '是否删除(0:未删除,1:已删除)',
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`),
  KEY `idx_gameapp_id` (`gameapp_id`),
  KEY `idx_view_time` (`view_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户浏览记录表';

-- 初始化角色数据
INSERT INTO `role` (`name`, `code`, `description`) VALUES
('超级管理员', 'super_admin', '拥有全部权限'),
('审核管理员', 'reviewer', '负责管理上架流程，审核游戏/应用上架申请'),
('运维人员', 'operator', '负责维护推广位和营销活动');

-- 初始化权限数据
INSERT INTO `permission` (`name`, `code`, `description`) VALUES
('应用审核', 'app_review', '审核游戏/应用上架申请'),
('推广位管理', 'placement_manage', '管理推广位位置和规则'),
('预算设置', 'budget_manage', '设置和管理推广预算'),
('数据统计', 'data_stats', '查看数据统计和分析'),
('系统配置', 'system_config', '管理系统配置'),
('用户管理', 'user_manage', '管理后台用户和权限');

-- 初始化角色权限关系
-- 超级管理员权限
INSERT INTO `role_permission` (`role_id`, `permission_id`) 
SELECT 1, id FROM `permission`;

-- 审核管理员权限
INSERT INTO `role_permission` (`role_id`, `permission_id`) 
SELECT 2, id FROM `permission` WHERE `code` IN ('app_review', 'data_stats');

-- 运维人员权限
INSERT INTO `role_permission` (`role_id`, `permission_id`) 
SELECT 3, id FROM `permission` WHERE `code` IN ('placement_manage', 'budget_manage', 'data_stats');

-- 初始化超级管理员账号 (密码: admin123)
INSERT INTO `admin` (`username`, `password`, `real_name`, `role_id`, `status`) VALUES
('admin', '$2a$10$nP.YhEwKIkp6Zx.fCEO3aOjv9m5GWi1QJGkJB0qsKIBGRYCdL9oeO', '系统管理员', 1, 1); 

-- 添加权限
INSERT INTO `permission` (`name`, `code`, `description`) VALUES
('抽奖活动管理', 'lottery_manage', '管理抽奖活动的创建、修改和删除'),
('抽奖记录查看', 'lottery_record_view', '查看用户抽奖和中奖记录');

-- 为超级管理员添加抽奖活动权限
INSERT INTO `role_permission` (`role_id`, `permission_id`) 
SELECT 1, id FROM `permission` WHERE `code` IN ('lottery_manage', 'lottery_record_view');

-- 为运维人员添加抽奖活动权限
INSERT INTO `role_permission` (`role_id`, `permission_id`) 
SELECT 3, id FROM `permission` WHERE `code` IN ('lottery_manage', 'lottery_record_view'); 