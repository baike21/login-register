import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AlertService, UserService} from '../_services/index';
import {isUndefined} from "util";

@Component({
  selector: 'app-register-container',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})

export class RegisterComponent implements OnInit {
  model: any = {};  // new user account
  // local username, password, confirmpassword
  private username: string;
  private password: string;
  private confirmpassword: string;


  // component's status flags
  private loading: boolean;  // loading to register
  private submitted: boolean;
  private usernamefocus: boolean;  // 光标是否聚焦
  private usernameblur: boolean;
  private pwdfocus: boolean;
  private pwdblur: boolean;
  private cpwdfocus: boolean;  // comfirm password
  private cpwdblur: boolean;

  currentStyles: {};
  currentPasswordStyles: {};
  currentComfirmPasswordStyles: {};


  constructor(private router: Router,
              private userService: UserService,
              private alertService: AlertService) {
  }

  // 查看username控件的样式设置
  setCurrentStyles() {
    this.currentStyles = {
      'box-shadow': this.usernamefocus && !this.submitted ? '0 0 10px #4169E1' : this.invalidUsername() ? '0 0 10px #B22222' : 'none',
    };
    return this.currentStyles;
  }

  // 查看password控件的样式设置
  setCurrentPasswordStyles() {
    this.currentPasswordStyles = {
      'box-shadow': this.pwdfocus && !this.submitted ? '0 0 10px #4169E1' : this.invalidPassword() ? '0 0 10px #B22222' : 'none',
    };
    return this.currentPasswordStyles;
  }
  // 查看comfirm password控件的样式设置
  setCurrentComfirmPasswordStyles() {
    this.currentComfirmPasswordStyles = {
      'box-shadow': this.cpwdfocus && !this.submitted ? '0 0 10px #4169E1' : this.invalidComfirmPassword() ? '0 0 10px #B22222' : 'none',
    };
    return this.currentPasswordStyles;
  }

  // 当前输入框样式监听
  invalidUsername() {
    if (this.invalidFormat() || this.invalidSubmitUsername()) {
      return true;
    } else {
      return false;
    }
  }

  // 初始化执行函数
  ngOnInit() {
    this.loading = false;
    this.submitted = false;
    this.usernamefocus = true;
    this.usernameblur = false;
    this.pwdfocus = false;
    this.cpwdfocus = false;
    this.pwdblur = true;
    this.cpwdblur = true;

    this.setCurrentStyles();
    this.setCurrentPasswordStyles();
    this.setCurrentComfirmPasswordStyles();
  }

  // 光标聚焦到username输入框的事件
  usernameFocus() {
    this.usernamefocus = true;
    this.usernameblur = false;
    this.pwdfocus = false;
    this.pwdblur = true;
    this.cpwdfocus = false;
    this.cpwdblur = true;
    this.submitted = false;

  }

  // 光标聚焦到password输入框的事件
  passwdFocus() {
    this.pwdfocus = true;
    this.pwdblur = false;
    this.cpwdfocus = false;
    this.cpwdblur = true;
    this.usernamefocus = false;
    this.usernameblur = true;
    this.submitted = false;
  }
  // 光标聚焦到confirm password输入框的事件
  confirmpasswdFocus() {
    this.pwdfocus = true;
    this.pwdblur = false;
    this.cpwdfocus = false;
    this.cpwdblur = true;
    this.usernamefocus = false;
    this.usernameblur = true;
    this.submitted = false;
  }

  // 用户名blur事件,只关心描述控件的状态位
  usernameBlur() {
    this.usernameblur = true;
    this.usernamefocus = false;
  }


  // 邮箱格式校验
  private checkEmail(raw_email: string): boolean {
    // 格式检测对字符串前后的无效字符例如空格是容忍的
    const emailRegex = /^\s*[A-Za-z0-9]+([-_.][A-Za-z0-9]+)*@([A-Za-z0-9]+[-.])+[A-Za-z0-9]{2,5}\s*$/;
    if (emailRegex.test(raw_email)) {
      return true;  // 合法的邮箱格式
    } else {
      console.log('invalid email address');
      return false;
    }
  }

  // 手机号格式校验 1** ********
  private checkPhone(raw_phone: string): boolean {
    // 根据移动联通电信三大运营商的号码 正则表达式前3位随时保持更新 后面是8位数字
    const PhoneReg = /^\s*((13[0-9])|(14[5|7])|(15([0|3]|[5-9]))|(18[0,5-9])|(17[0-9]))\d{8}\s*$/;
    if (PhoneReg.test(raw_phone)) {
      return true;  // 合法手机号
    } else {
      // console.log('invalid phone number');
      return false;
    }
  }


  // 判别邮箱格式，只关心绑定的数据
  invalidEmailFormat(): boolean {
    // 先做输入值非空检查
    // 用户什么都没输(pristine)或者输入了又删掉了（novalue）, 或者输入一串空格之类的无效字符，检测器都不进行格式检查
    if (!( isUndefined(this.user.username) || this.user.username === '' ) && !(/^\s+$/.test(this.user.username))) {
      // 检查一下email格式
      if (this.checkEmail(this.user.username) || this.usernamefocus) {
        return false;  // email格式正确，或者光标定位在控件上时认为处于待修改状态 气泡也不显示
      } else {
        return true;  // email格式不对且失去焦点时 气泡显示
      }
    } else {
      return false;
    }
  }


  // 判别phone格式是否错误
  invalidPhoneFormat(): boolean {
    if (!( isUndefined(this.user.username) || this.user.username === '' ) && !(/^\s+$/.test(this.user.username))) {
      // 检查一下phone格式
      if (this.checkPhone(this.user.username) || this.usernamefocus) {
        return false;  // phone格式正确,光标定位在控件上时认为处于待修改状态，也不显示
      } else {
        return true;  // phone格式不对
      }
    } else {
      return false;
    }
  }

  // 查询状态，决定是否显示格式错误的气泡
  invalidFormat(): boolean {
    // 两种格式有一种通过就认为没错
    if (!this.invalidEmailFormat() || !this.invalidPhoneFormat()) {
      // console.log('不认为格式有误');
      return false;
    } else {
      return true;
    }
  }

  // 查看状态,决定提交后是否显示空用户名的气泡
  invalidSubmitUsername(): boolean {
    if (this.submitted) {
      // 非空检查
      if (isUndefined(this.user.username) || this.user.username === '' || /^\s+$/.test(this.user.username)) {
        // console.log('提交的用户名为空');
        return true;  // 不合法的用户名输入,显示错误提示给用户
      } else {
        return false;
      }
    } else {
      return false;  // 用户没点提交键，不显示
    }
  }

  // 用户提交时查看password状态，决定气泡提示是否显示, 只在用户名没错时才检查密码
  invalidPassword(): boolean {
    if (this.submitted && !this.passwdfocus && !this.invalidUsername()) {
      if ((isUndefined(this.password) || this.password === '' || /\s+/.test(this.user.password))) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  // check if the two passwords are same
  differentPassword(): boolean {

  }

  // // Ask server database to check if the username is duplicate
  // duplicateUsername(raw_username: string): boolean {
  //
  //   return true;  // is duplicate ,please change a username to register
  //
  // }

  // go to register
  register() {
    this.loading = true;

    this.model = {'username': this.username, 'password': this.password};
    this.userService.create(this.model)
      .subscribe(
        data => {
          this.alertService.success('注册成功', true);
          this.router.navigate(['/login']);
        },
        error => {
          this.alertService.error(error);
          this.loading = false;
        });
  }
}
